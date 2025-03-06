import { Request, Response } from "express";
import { createUser, getUserByWalletAddress } from "../services/user.service";
import { getAllDAOs } from "../services/daoService";
import { ethers } from "ethers";
import { DAO } from "../models/dao";

export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create EVM wallet for the user
    const wallet = ethers.Wallet.createRandom();
    const agentWallet = wallet.address;
    const agentWalletPrivateKey = wallet.privateKey;

    // Fetch all DAOs and create memberships
    const allDAOs = await getAllDAOs();
    const daoMemberships: DAO[] = allDAOs.map((dao) => ({
      id: dao.id,
      name: dao.name,
      tokenAddress: dao.tokenAddress,
      tokenSymbol: dao.tokenSymbol,
      governanceContractAddress: dao.governanceContractAddress,
      description: dao.description,
      tokenBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const userId = await createUser({
      walletAddress,
      agentWallet,
      agentWalletPrivateKey,
      daoMemberships,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "User created successfully",
      userId,
      agentWallet,
      daoMemberships,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserByWalletHandler = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const user = await getUserByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
