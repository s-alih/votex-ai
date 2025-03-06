import { GoogleGenerativeAI } from "@google/generative-ai";

export class EmbeddingService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string) {
    this.model = "embedding-001";
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Get the embeddings model
      const embedModel = this.genAI.getGenerativeModel({ model: this.model });

      // Generate embeddings
      const result = await embedModel.embedContent(text);

      // Get the embedding values
      const embedding = result.embedding;

      if (!embedding) {
        throw new Error(
          "Failed to generate embeddings: No embedding data received"
        );
      }

      return Array.from(embedding.values);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  }
}
