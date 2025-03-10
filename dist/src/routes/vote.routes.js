"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vote_service_1 = require("../services/vote.service");
const router = (0, express_1.Router)();
// Get votes by user ID
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const votes = await (0, vote_service_1.getVotesByUserId)(userId);
        res.status(200).json({ votes });
    }
    catch (error) {
        console.error("Error fetching votes:", error);
        res.status(500).json({ error: "Failed to fetch votes" });
    }
});
// Get votes by agent ID
router.get("/agent/:agentId", async (req, res) => {
    try {
        const { agentId } = req.params;
        const votes = await (0, vote_service_1.getVotesByAgentId)(agentId);
        res.status(200).json({ votes });
    }
    catch (error) {
        console.error("Error fetching votes:", error);
        res.status(500).json({ error: "Failed to fetch votes" });
    }
});
exports.default = router;
