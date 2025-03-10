import { AIAgent } from "./agent";
import { DAO } from "./dao";
import { Proposal } from "./proposal";
import { User } from "./user";

export interface Vote {
  id: string; // Unique vote ID (UUID)
  proposalId: string; // Proposal ID the vote is for
  agentId: string;
  proposal: Proposal;
  userId: string;
  dao: DAO; // Full DAO object
  user: User; // Full User object
  agent: AIAgent; // Full AI Agent object
  voteType?: "FOR" | "AGAINST"; // Vote choice (can be undefined if not voted)
  isVoted: boolean; // Whether the AI agent voted or not
  suggestedVote?: "FOR" | "AGAINST"; // AI's suggested vote if not cast
  voteReason?: string; // AI's reasoning for the vote
  voteExplanation?: string; // Detailed explanation of why the vote was cast
  aiAnalysis?: string; // AI's analysis of the vote
  timestamp: number; // Timestamp of when the vote was cast
  txHash?: string; // Blockchain transaction hash (optional)
}
