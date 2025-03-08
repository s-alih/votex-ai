import { Request, Response } from "express";
import {
  createAIAgent,
  getAgentsByUserId,
  getAgentById,
  updateAgent,
} from "../services/agent.service";
import { AIAgent } from "../models/agent";
import { getUserByWalletAddress } from "../services/user.service";
import { getDAOById } from "../services/daoService";
import { EmbeddingService } from "../services/embeddingService";
import * as dotenv from "dotenv";

dotenv.config();

const embeddingService = new EmbeddingService(process.env.GOOGLE_API_KEY || "");

export const getAgentsByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const agents = await getAgentsByUserId(userId);
    res.status(200).json({ agents });
  } catch (error) {
    console.error("Error fetching AI agents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createAIAgentHandler = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      daoId,
      isAutoVoteEnabled,
      governanceStrategy,
      riskProfile,
      voteAlignment,
    } = req.body;

    if (
      !userId ||
      !daoId ||
      !governanceStrategy ||
      !riskProfile ||
      !voteAlignment
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await getUserByWalletAddress(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const dao = await getDAOById(daoId);
    if (!dao) {
      return res.status(404).json({ error: "DAO not found" });
    }

    const preferencesEmbedding = await embeddingService.generateEmbedding(
      `dao: ${dao.name}
      governanceStrategy: ${governanceStrategy}
      Risk Profile Percentile: ${riskProfile}
      voteAlignment: ${voteAlignment}`
    );

    const agentData: AIAgent = {
      userId,
      daoId,
      isAutoVoteEnabled,
      preferencesEmbedding,
      governanceStrategy,
      riskProfile,
      voteAlignment,
      user,
      dao,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const agent = await createAIAgent(agentData);

    res.status(201).json({ agent });
  } catch (error) {
    console.error("Error creating AI Agent:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
// Agent. isAutoVoteEnabled: boolean;
export const toggleDelegationHandler = async (req: Request, res: Response) => {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // get the agent by id and upate isAutoVoteEnabled to the opposite of what it is
    const agent = await getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const updatedAgent = await updateAgent(agentId, {
      isAutoVoteEnabled: !agent.isAutoVoteEnabled,
    });

    res.status(200).json({ agent: updatedAgent });
  } catch (error) {
    console.error("Error toggling delegation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
