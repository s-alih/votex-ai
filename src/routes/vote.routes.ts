import { Router } from "express";
import { Request, Response } from "express";
import { getVotesByUserId, getVotesByAgentId } from "../services/vote.service";

const router = Router();

// Get votes by user ID
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const votes = await getVotesByUserId(userId);
    res.status(200).json({ votes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

// Get votes by agent ID
router.get("/agent/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const votes = await getVotesByAgentId(agentId);
    res.status(200).json({ votes });
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

export default router;
