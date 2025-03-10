import { Request, Response } from "express";
import { getVotesByAgentId, getVotesByUserId } from "../services/vote.service";

export const getVotesByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const votes = await getVotesByUserId(userId);
    res.status(200).json({ votes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVotesByAgentIdHandler = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }

    const votes = await getVotesByAgentId(agentId);
    res.status(200).json({ votes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
