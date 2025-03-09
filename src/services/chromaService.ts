import { ChromaClient, Collection } from "chromadb";
import { Vote } from "../models/vote";
import { EmbeddingService } from "./embeddingService";

export class ChromaService {
  private client: ChromaClient;
  private historicalVotesCollection!: Collection;
  private userVotesCollection!: Collection;

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_DB_URL || "http://localhost:8000",
    });
    this.initializeCollections();
  }

  private async initializeCollections() {
    try {
      // Collection for historical votes from Snapshot and Tally
      this.historicalVotesCollection = await this.client.getOrCreateCollection({
        name: "historical_votes",
        metadata: { description: "Historical votes from Snapshot and Tally" },
      });

      // Collection for user-specific voting patterns
      this.userVotesCollection = await this.client.getOrCreateCollection({
        name: "user_votes",
        metadata: {
          description: "User-specific voting patterns and preferences",
        },
      });
    } catch (error) {
      console.error("Error initializing collections:", error);
      throw error;
    }
  }

  async storeHistoricalVote(vote: any) {
    const embedding = await this.generateEmbedding(vote.description);
    await this.historicalVotesCollection.add({
      ids: [vote.id],
      embeddings: [embedding],
      metadatas: [vote],
      documents: [JSON.stringify(vote)],
    });
  }

  async storeUserVote(userId: string, vote: Vote) {
    const embedding = await this.generateEmbedding(
      `${vote.voteType} ${vote.voteReason} ${vote.voteExplanation}`
    );
    const metadata = {
      voterUserId: userId,
      id: vote.id,
      proposalId: vote.proposalId,
      userId: vote.userId,
      voteType: vote.voteType || "",
      isVoted: vote.isVoted,
      suggestedVote: vote.suggestedVote || "",
      voteReason: vote.voteReason || "",
      voteExplanation: vote.voteExplanation || "",
      aiAnalysis: vote.aiAnalysis || "",
      timestamp: vote.timestamp,
      daoData: JSON.stringify(vote.dao),
      userData: JSON.stringify(vote.user),
      agentData: JSON.stringify(vote.agent),
    };

    await this.userVotesCollection.add({
      ids: [`${userId}_${vote.id}`],
      embeddings: [embedding],
      metadatas: [metadata],
      documents: [JSON.stringify(vote)],
    });
  }

  async queryHistoricalVotes(query: string, limit: number = 5) {
    const embedding = await this.generateEmbedding(query);
    return await this.historicalVotesCollection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
    });
  }

  async getUserVotingHistory(
    userId: string,
    query: string,
    limit: number = 10
  ) {
    const embedding = await this.generateEmbedding(query);
    return await this.userVotesCollection.query({
      queryEmbeddings: [embedding],
      where: { voterUserId: userId },
      nResults: limit,
    });
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Use the existing EmbeddingService
    const embeddingService = new EmbeddingService(
      process.env.GOOGLE_API_KEY || ""
    );
    return await embeddingService.generateEmbedding(text);
  }
}
