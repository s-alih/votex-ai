import { Router } from "express";
import {
  createAIAgentHandler,
  getAgentsByUserIdHandler,
  toggleDelegationHandler,
} from "../controllers/agent.controller";
import { Request, Response } from "express";

const router = Router();

// toggle delegation
router.post("/agents/toggle-delegation", async (req: Request, res: Response) => {
  await toggleDelegationHandler(req, res);
});

// Get all agents by user ID
router.get("/agents/user/:userId", async (req: Request, res: Response) => {
  await getAgentsByUserIdHandler(req, res);
});

router.post("/agents", async (req: Request, res: Response) => {
  await createAIAgentHandler(req, res);
});

export default router;
