import { Router } from "express";
import {
  createUserHandler,
  getUserByWalletHandler,
} from "../controllers/user.controller";
import { Request, Response } from "express";

const router = Router();

router.post("/users", async (req: Request, res: Response) => {
  await createUserHandler(req, res);
});

router.get(
  "/users/wallet/:walletAddress",
  async (req: Request, res: Response) => {
    await getUserByWalletHandler(req, res);
  }
);

export default router;
