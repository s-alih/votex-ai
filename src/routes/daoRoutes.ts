import * as express from "express";
import {
  createDAOHandler,
  getAllDAOsHandler,
  getDAOByIdHandler,
} from "../controllers/daoController";
import { Request, Response } from "express";

const router = express.Router();

// Get all DAOs - this must come before the :id route
router.get("/all", async (req: Request, res: Response) => {
  console.log("GET /api/dao/all");
  await getAllDAOsHandler(req, res);
});

// Create new DAO
router.post("/", async (req: Request, res: Response) => {
  await createDAOHandler(req, res);
});

// Get DAO by ID
router.get("/:id", async (req: Request, res: Response) => {
  await getDAOByIdHandler(req, res);
});

export default router;
