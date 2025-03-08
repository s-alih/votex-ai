import { ethers } from "ethers";
import { proposalsRef, agentsRef } from "../config/index";
import { fetchAgents, callAIForVoting, Proposal } from "./aiService";
import { getProposal, updateProposal } from "./proposalService";
import { getAllDAOs } from "./daoService";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);

// Add contract ABI and address
const GOVERNANCE_ABI = [
  "function delegateVote(address _delegate) external",
  "function revokeDelegation() external",
  "function voteDelegation(address) public view returns (address)",
  "function aiAgentUser(address) public view returns (address)",
  "event ProposalCreated(uint256 id, string description, address proposer)",
  "event VoteCast(uint256 proposalId, address voter, bool vote, uint256 weight)",
  "event ProposalExecuted(uint256 id, bool passed)",
  "event VoteDelegated(address indexed voter, address indexed delegate)",
  "event DelegationRevoked(address indexed voter)",
];

export async function initializeProposalCreatedListeners() {
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

      console.log(
        `🎯 Listening to proposals from ${dao.name} at ${dao.governanceContractAddress}`
      );

      contract.on("ProposalCreated", async (id, description, proposer) => {
        console.log(`📌 New Proposal in ${dao.name}: ${description}`);
        console.log(`Proposer: ${proposer}`);

        // Create proposal object
        const proposal: Proposal = {
          id: id.toString(),
          daoId: dao.id,
          daoName: dao.name,
          description,
          proposer,
          votesFor: 0,
          votesAgainst: 0,
          executed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Store in Firestore
        await proposalsRef.doc(id.toString()).set(proposal);

        // Fetch AI agents for this DAO
        const agents = await fetchAgents(dao.id);
        for (const agent of agents) {
          await callAIForVoting(proposal, agent);
        }
      });
    });

    console.log("🚀 Event listeners initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing event listeners:", error);
    throw error;
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
