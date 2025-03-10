import { Router } from "express";
import {
  createAIAgentHandler,
  getAgentsByUserIdHandler,
  toggleDelegationHandler,
} from "../controllers/agent.controller";
import { Request, Response } from "express";

const router = Router();

// toggle delegation
router.post("/toggle-delegation", async (req: Request, res: Response) => {
  await toggleDelegationHandler(req, res);
});

// Get all agents by user ID
router.get("/user/:userId", async (req: Request, res: Response) => {
  await getAgentsByUserIdHandler(req, res);
});

// Create new agent
router.post("/", async (req: Request, res: Response) => {
  await createAIAgentHandler(req, res);
});

export default router;
