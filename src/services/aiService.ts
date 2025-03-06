import { agentsRef } from "../config";
import { AIAgent } from "../models/agent";
import { ChromaService } from "./chromaService";
import { GeminiService } from "./geminiService";
import { Vote } from "../models/vote";
import { db } from "../config/firebase";

export interface Proposal {
  id: string;
  daoId: string;
  daoName: string;
  description: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    const historicalVotes = await chromaService.queryHistoricalVotes(
      proposal.description
    );

    // Get user's voting history
    const userVotes = await chromaService.getUserVotingHistory(
      agent.userId,
      proposal.description
    );

    // Analyze proposal using Gemini
    const analysis = await geminiService.analyzeProposal(
      proposal,
      agent,
      historicalVotes,
      userVotes
    );

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
