"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVotesByAgentIdHandler = exports.getVotesByUserIdHandler = void 0;
const vote_service_1 = require("../services/vote.service");
const getVotesByUserIdHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const votes = await (0, vote_service_1.getVotesByUserId)(userId);
        res.status(200).json({ votes });
    }
    catch (error) {
        console.error("Error fetching votes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getVotesByUserIdHandler = getVotesByUserIdHandler;
const getVotesByAgentIdHandler = async (req, res) => {
    try {
        const { agentId } = req.params;
        if (!agentId) {
            return res.status(400).json({ error: "Agent ID is required" });
        }
        const votes = await (0, vote_service_1.getVotesByAgentId)(agentId);
        res.status(200).json({ votes });
    }
    catch (error) {
        console.error("Error fetching votes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getVotesByAgentIdHandler = getVotesByAgentIdHandler;
