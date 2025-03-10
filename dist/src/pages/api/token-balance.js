"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const viem_1 = require("viem");
const chains_1 = require("@/config/chains");
const viem_2 = require("viem");
const client = (0, viem_1.createPublicClient)({
    chain: chains_1.sonicTestnet,
    transport: (0, viem_1.http)(),
});
async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { address, tokenAddress } = req.query;
    if (!address || !tokenAddress) {
        return res.status(400).json({ message: "Missing required parameters" });
    }
    try {
        // Create contract instance
        const contract = (0, viem_1.getContract)({
            address: tokenAddress,
            abi: viem_2.erc20Abi,
            publicClient: client,
        });
        // Get balance
        const balance = await contract.read.balanceOf([address]);
        return res.status(200).json({ balance: balance.toString() });
    }
    catch (error) {
        console.error("Error fetching token balance:", error);
        return res.status(500).json({ message: "Error fetching token balance" });
    }
}
