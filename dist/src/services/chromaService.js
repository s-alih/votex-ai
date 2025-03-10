"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaService = void 0;
const chromadb_1 = require("chromadb");
const embeddingService_1 = require("./embeddingService");
class ChromaService {
    client;
    historicalVotesCollection;
    userVotesCollection;
    constructor() {
        this.client = new chromadb_1.ChromaClient({
            path: process.env.CHROMA_DB_URL || "http://localhost:8000",
        });
        this.initializeCollections();
    }
    async initializeCollections() {
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
        }
        catch (error) {
            console.error("Error initializing collections:", error);
            throw error;
        }
    }
    async storeHistoricalVote(vote) {
        const embedding = await this.generateEmbedding(vote.description);
        await this.historicalVotesCollection.add({
            ids: [vote.id],
            embeddings: [embedding],
            metadatas: [vote],
            documents: [JSON.stringify(vote)],
        });
    }
    async storeUserVote(userId, vote) {
        const embedding = await this.generateEmbedding(`${vote.voteType} ${vote.voteReason} ${vote.voteExplanation}`);
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
    async queryHistoricalVotes(query, limit = 5) {
        const embedding = await this.generateEmbedding(query);
        return await this.historicalVotesCollection.query({
            queryEmbeddings: [embedding],
            nResults: limit,
        });
    }
    async getUserVotingHistory(userId, query, limit = 10) {
        const embedding = await this.generateEmbedding(query);
        return await this.userVotesCollection.query({
            queryEmbeddings: [embedding],
            where: { voterUserId: userId },
            nResults: limit,
        });
    }
    async generateEmbedding(text) {
        // Use the existing EmbeddingService
        const embeddingService = new embeddingService_1.EmbeddingService(process.env.GOOGLE_API_KEY || "");
        return await embeddingService.generateEmbedding(text);
    }
}
exports.ChromaService = ChromaService;
