"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proposalService_1 = require("../services/proposalService");
const router = (0, express_1.Router)();
router.post("/create", async (req, res) => {
    try {
        const { title, description, daoId } = req.body;
        if (!title || !description) {
            res
                .status(400)
                .json({ error: "Both title and description are required" });
            return;
        }
        const proposalId = await (0, proposalService_1.createNewProposal)(title, description, daoId);
        res.status(201).json({
            message: "Proposal created successfully",
            proposalId,
        });
    }
    catch (error) {
        console.error("Error in create proposal route:", error);
        res.status(500).json({
            error: "Failed to create proposal",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// get all proposals
router.get("/all", async (req, res) => {
    const proposals = await (0, proposalService_1.getAllProposals)();
    res.status(200).json({ proposals });
});
// Get active proposals
router.get("/active", async (req, res) => {
    try {
        const proposals = await (0, proposalService_1.getActiveProposals)();
        res.status(200).json({ proposals });
    }
    catch (error) {
        console.error("Error fetching active proposals:", error);
        res.status(500).json({ error: "Failed to fetch active proposals" });
    }
});
// get proposal by user id
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const proposals = await (0, proposalService_1.getProposalsByUserId)(userId);
    res.status(200).json(proposals);
});
// Create test proposal (development only)
router.post("/test", async (req, res) => {
    try {
        const { daoId } = req.body;
        if (!daoId) {
            res.status(400).json({ error: "daoId is required" });
            return;
        }
        const proposalId = await (0, proposalService_1.createTestProposal)(daoId);
        res.status(201).json({
            message: "Test proposal created successfully",
            proposalId,
        });
    }
    catch (error) {
        console.error("Error creating test proposal:", error);
        res.status(500).json({ error: "Failed to create test proposal" });
    }
});
exports.default = router;
