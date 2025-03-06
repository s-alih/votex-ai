import { Router } from "express";
import { getVotesByUserIdHandler } from "../controllers/vote.controller";
import { Request, Response } from "express";

const router = Router();

router.get("/votes/user/:userId", async (req: Request, res: Response) => {
  await getVotesByUserIdHandler(req, res);
});

export default router;
