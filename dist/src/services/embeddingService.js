"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class EmbeddingService {
    genAI;
    model;
    constructor(apiKey) {
        this.model = "embedding-001";
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateEmbedding(text) {
        try {
            // Get the embeddings model
            const embedModel = this.genAI.getGenerativeModel({ model: this.model });
            // Generate embeddings
            const result = await embedModel.embedContent(text);
            // Get the embedding values
            const embedding = result.embedding;
            if (!embedding) {
                throw new Error("Failed to generate embeddings: No embedding data received");
            }
            return Array.from(embedding.values);
        }
        catch (error) {
            console.error("Error generating embeddings:", error);
            throw error;
        }
    }
}
exports.EmbeddingService = EmbeddingService;
