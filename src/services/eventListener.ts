import { ethers } from "ethers";
import { proposalsRef, agentsRef } from "../config/index";
import { fetchAgents, callAIForVoting } from "./aiService";
import { getProposal, updateProposal } from "./proposalService";
import { getAllDAOs } from "./daoService";
import * as dotenv from "dotenv";
import { Proposal } from "../models/proposal";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);

// Add contract ABI and address
const GOVERNANCE_ABI = [
  "function delegateVote(address _delegate) external",
  "function revokeDelegation() external",
  "function voteDelegation(address) public view returns (address)",
  "function aiAgentUser(address) public view returns (address)",
  "event ProposalCreated(uint256 id, string title, string description, address proposer)",
  "event VoteCast(uint256 proposalId, address voter, bool vote, uint256 weight)",
  "event ProposalExecuted(uint256 id, bool passed)",
  "event VoteDelegated(address indexed voter, address indexed delegate)",
  "event DelegationRevoked(address indexed voter)",
];

// Keep track of the last processed block for each DAO
const lastProcessedBlocks: { [daoAddress: string]: number } = {};

export async function initializeProposalCreatedListeners() {
  try {
    // Fetch all DAOs
    const daos = await getAllDAOs();
    console.log(`📡 Setting up listeners for ${daos.length} DAOs...`);

    // Set up polling for each DAO
    for (const dao of daos) {
      const contract = new ethers.Contract(
        dao.governanceContractAddress,
        GOVERNANCE_ABI,
        provider
      );

      console.log(
        `🎯 Listening to proposals from ${dao.name} at ${dao.governanceContractAddress}`
      );

      // Start polling for events
      pollForEvents(contract, dao);
    }

    console.log("🚀 Event listeners initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing event listeners:", error);
    throw error;
  }
}

async function pollForEvents(contract: ethers.Contract, dao: any) {
  try {
    // Get the current block number
    const currentBlock = await provider.getBlockNumber();
    const startBlock =
      lastProcessedBlocks[dao.governanceContractAddress] || currentBlock - 1000; // Start from last 1000 blocks if no previous block

    // Get events from the last processed block to current
    const proposalEvents = await contract.queryFilter(
      contract.filters.ProposalCreated(),
      startBlock,
      currentBlock
    );

    const voteEvents = await contract.queryFilter(
      contract.filters.VoteCast(),
      startBlock,
      currentBlock
    );

    // Process ProposalCreated events
    for (const event of proposalEvents) {
      const args = (event as ethers.EventLog).args;
      if (!args) continue;
      console.log(args);

      const [id, title, description, proposer] = args;
      console.log(`📌 New Proposal in ${dao.name}: ${description}`);
      console.log(`Proposer: ${proposer}`);

      // Create proposal object
      const proposal: Proposal = {
        id: id.toString(),
        daoId: dao.id,
        dao: dao,
        daoName: dao.name,
        title,
        description,
        proposer,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        votesFor: 0,
        votesAgainst: 0,
        executed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in Firestore
      await proposalsRef.doc(`${dao.id}-${id}`).set(proposal);

      // Fetch AI agents for this DAO
      const agents = await fetchAgents(dao.id);
      for (const agent of agents) {
        await callAIForVoting(proposal, agent);
      }
    }

    // Process VoteCast events
    for (const event of voteEvents) {
      const args = (event as ethers.EventLog).args;
      if (!args) continue;

      const [proposalId, voter, vote, weight] = args;
      const proposal = await getProposal(proposalId);
      if (proposal) {
        proposal.votesFor += weight;
        await updateProposal(proposal);
      }
    }

    // Update the last processed block
    lastProcessedBlocks[dao.governanceContractAddress] = currentBlock;

    // Poll again after 12 seconds (average block time)
    setTimeout(() => pollForEvents(contract, dao), 12000);
  } catch (error) {
    console.error(`Error polling events for ${dao.name}:`, error);
    // Retry after 30 seconds on error
    setTimeout(() => pollForEvents(contract, dao), 30000);
  }
}

// need to add a listener for the VoteCast event and update the proposal with the vote

export async function initializeVoteCastListeners() {
  try {
    // Fetch all DAOs
    const daos = await getAllDAOs();
    console.log(`📡 Setting up listeners for ${daos.length} DAOs...`);

    // Set up listeners for each DAO
    daos.forEach((dao) => {
      const contract = new ethers.Contract(
        dao.governanceContractAddress,
        GOVERNANCE_ABI,
        provider
      );

      contract.on("VoteCast", async (proposalId, voter, vote, weight) => {
        // update the proposal with the vote
        const proposal = await getProposal(proposalId);
        proposal.votesFor += weight;
        await updateProposal(proposal);
      });
    });
  } catch (error) {
    console.error("❌ Error initializing vote cast listeners:", error);
    throw error;
  }
}
