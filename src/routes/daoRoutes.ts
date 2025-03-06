import * as express from "express";
import {
  createDAOHandler,
  getDAOByIdHandler,
} from "../controllers/daoController";
import { Request, Response } from "express";

const router = express.Router();

router.get("/dao/:id", async (req: Request, res: Response) => {
  await getDAOByIdHandler(req, res);
});

router.post("/dao", async (req: Request, res: Response) => {
  await createDAOHandler(req, res);
});


export default router;
