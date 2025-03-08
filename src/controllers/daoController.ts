import { Request, Response } from "express";
import { createDAO, getAllDAOs, getDAOById } from "../services/daoService";

export const createDAOHandler = (req: Request, res: Response) => {
  try {
    const {
      name,
      tokenAddress,
      tokenSymbol,
      governanceContractAddress,
      description,
      website,
    } = req.body;

    if (!name || !tokenAddress || !tokenSymbol || !governanceContractAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newDAO = createDAO({
      name,
      tokenAddress,
      tokenSymbol,
      governanceContractAddress,

      description,
    });
    res.status(201).json(newDAO);
  } catch (error) {
    console.error("Error creating DAO:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDAOByIdHandler = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dao = getDAOById(id);

    if (!dao) {
      return res.status(404).json({ error: "DAO not found" });
    }

    res.status(200).json(dao);
  } catch (error) {
    console.error("Error fetching DAO:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllDAOsHandler = async (req: Request, res: Response) => {
  try {
    console.log("Getting all DAOs...");
    const daos = await getAllDAOs();
    console.log("Found DAOs:", daos.length);
    res.status(200).json({ daos });
  } catch (error) {
    console.error("Error fetching DAOs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
