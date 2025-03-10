"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByWalletHandler = exports.createUserHandler = void 0;
const user_service_1 = require("../services/user.service");
const daoService_1 = require("../services/daoService");
const ethers_1 = require("ethers");
const createUserHandler = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Create EVM wallet for the user
        const wallet = ethers_1.ethers.Wallet.createRandom();
        const agentWallet = wallet.address;
        const agentWalletPrivateKey = wallet.privateKey;
        // Fetch all DAOs and create memberships
        const allDAOs = await (0, daoService_1.getAllDAOs)();
        const daoMemberships = allDAOs.map((dao) => ({
            id: dao.id,
            name: dao.name,
            imageUrl: dao.imageUrl,
            tokenAddress: dao.tokenAddress,
            tokenSymbol: dao.tokenSymbol,
            governanceContractAddress: dao.governanceContractAddress,
            description: dao.description,
            tokenBalance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        const userId = await (0, user_service_1.createUser)({
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
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createUserHandler = createUserHandler;
const getUserByWalletHandler = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!walletAddress) {
            return res.status(400).json({ error: "Wallet address is required" });
        }
        const user = await (0, user_service_1.getUserByWalletAddress)(walletAddress);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getUserByWalletHandler = getUserByWalletHandler;
