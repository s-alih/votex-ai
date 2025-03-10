import { agentsRef } from "../config";
import { AIAgent } from "../models/agent";
import { ChromaService } from "./chromaService";
import { GeminiService } from "./geminiService";
import { Vote } from "../models/vote";
import { db } from "../config/firebase";
import { DAO } from "../models/dao";
import { Proposal } from "../models/proposal";
import { ethers } from "ethers";

export async function fetchAgents(daoId: string): Promise<AIAgent[]> {
  const snapshot = await agentsRef.where("daoId", "==", daoId).get();
  return snapshot.docs.map((doc) => doc.data() as AIAgent);
}

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

export async function callAIForVoting(
  proposal: Proposal,
  agent: AIAgent
): Promise<void> {
  try {
    console.log(
      `🤖 AI Agent for ${agent.user.walletAddress} analyzing proposal ${proposal.id}`
    );

    const chromaService = new ChromaService();
    const geminiService = new GeminiService(process.env.GOOGLE_API_KEY || "");

    // Get relevant historical votes
    const historicalVotesResponse = await chromaService.queryHistoricalVotes(
      proposal.description
    );
    const historicalVotes = historicalVotesResponse.metadatas || [];

    // Get user's voting history
    const userVotesResponse = await chromaService.getUserVotingHistory(
      agent.userId,
      proposal.description
    );
    const userVotes = userVotesResponse.metadatas || [];

    // Analyze proposal using Gemini
    const analysis = await geminiService.analyzeProposal(
      proposal,
      agent,
      historicalVotes,
      userVotes
    );
    console.log("Analysis:", analysis);

    // Create vote record
    const vote: Vote = {
      id: `${proposal.id}_${agent.userId}`,
      proposalId: proposal.id,
      proposal: proposal,
      userId: agent.userId,
      agentId: agent.id || "",
      dao: agent.dao,
      user: agent.user,
      agent: agent,
      voteType: analysis.voteType,
      isVoted: true,
      suggestedVote: analysis.voteType,
      voteReason: analysis.voteReason,
      voteExplanation: analysis.voteExplanation,
      aiAnalysis: analysis.aiAnalysis,
      timestamp: Date.now(),
    };

    // Store vote in Firestore
    await db.collection("votes").doc(vote.id).set(vote);

    // schedule the vote just beofore proposal.deadline
    const proposalDeadline = new Date(proposal.deadline);
    const now = new Date();
    const timeUntilVote = proposalDeadline.getTime() - now.getTime();
    setTimeout(async () => {
      vote.isVoted = true;
      await db
        .collection("votes")
        .doc(vote.id)
        .update({
          ...vote,
          timestamp: Date.now(),
        });

      // in we need call the smart contract to cast the vote
      const contract = new ethers.Contract(
        agent.dao.governanceContractAddress,
        GOVERNANCE_ABI,
        provider
      );

      // cast the vote
      const tx = await contract.castVote(proposal.id, vote.voteType, {
        gasLimit: 1000000,
      });
      await tx.wait();
    }, timeUntilVote);
    // Store vote in ChromaDB for future reference
    await chromaService.storeUserVote(agent.userId, vote);

    console.log({
      proposalId: proposal.id,
      agentId: agent.userId,
      vote: analysis.voteType,
      reason: analysis.voteReason,
    });
  } catch (error) {
    console.error(`Error in AI voting for proposal ${proposal.id}:`, error);
    throw error;
  }
}
