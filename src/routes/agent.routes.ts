import { Router } from "express";
import {
  createAIAgentHandler,
  getAgentsByUserIdHandler,
} from "../controllers/agent.controller";
import { Request, Response } from "express";

const router = Router();
router.get("/agents/user/:userId", async (req: Request, res: Response) => {
  await getAgentsByUserIdHandler(req, res);
});

router.post("/agents", async (req: Request, res: Response) => {
  await createAIAgentHandler(req, res);
});

export default router;
