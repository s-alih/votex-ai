import { Router, Request, Response } from "express";
import {
  createNewProposal,
  getProposalsByUserId,
  getActiveProposals,
  createTestProposal,
} from "../services/proposalService";

const router = Router();

router.post("/create", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      res
        .status(400)
        .json({ error: "Both title and description are required" });
      return;
    }

    const proposalId = await createNewProposal(title, description);
    res.status(201).json({
      message: "Proposal created successfully",
      proposalId,
    });
  } catch (error) {
    console.error("Error in create proposal route:", error);
    res.status(500).json({
      error: "Failed to create proposal",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get active proposals
router.get("/active", async (req: Request, res: Response) => {
  try {
    const proposals = await getActiveProposals();
    res.status(200).json({ proposals });
  } catch (error) {
    console.error("Error fetching active proposals:", error);
    res.status(500).json({ error: "Failed to fetch active proposals" });
  }
});

// get proposal by user id
router.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const proposals = await getProposalsByUserId(userId);
  res.status(200).json(proposals);
});

// Create test proposal (development only)
router.post("/test", async (req: Request, res: Response) => {
  try {
    const { daoId } = req.body;
    if (!daoId) {
      res.status(400).json({ error: "daoId is required" });
      return;
    }

    const proposalId = await createTestProposal(daoId);
    res.status(201).json({
      message: "Test proposal created successfully",
      proposalId,
    });
  } catch (error) {
    console.error("Error creating test proposal:", error);
    res.status(500).json({ error: "Failed to create test proposal" });
  }
});

export default router;
