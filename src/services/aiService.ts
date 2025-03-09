import { agentsRef } from "../config";
import { AIAgent } from "../models/agent";
import { ChromaService } from "./chromaService";
import { GeminiService } from "./geminiService";
import { Vote } from "../models/vote";
import { db } from "../config/firebase";
import { DAO } from "../models/dao";
import { Proposal } from "../models/proposal";

export async function fetchAgents(daoId: string): Promise<AIAgent[]> {
  const snapshot = await agentsRef.where("daoId", "==", daoId).get();
  return snapshot.docs.map((doc) => doc.data() as AIAgent);
}

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
      userId: agent.userId,
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
