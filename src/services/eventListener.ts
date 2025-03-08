import { ethers } from "ethers";
import { proposalsRef, agentsRef } from "../config/index";
import { fetchAgents, callAIForVoting, Proposal } from "./aiService";
import { getAllDAOs } from "./daoService";
import * as dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);

// ABI for the ProposalCreated event
const GOVERNANCE_ABI = [
  "event ProposalCreated(uint256 id, string description, address proposer)",
];

export async function initializeEventListeners() {
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
