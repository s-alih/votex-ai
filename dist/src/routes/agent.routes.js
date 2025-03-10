"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../controllers/agent.controller");
const router = (0, express_1.Router)();
// toggle delegation
router.post("/toggle-delegation", async (req, res) => {
    await (0, agent_controller_1.toggleDelegationHandler)(req, res);
});
// Get all agents by user ID
router.get("/user/:userId", async (req, res) => {
    await (0, agent_controller_1.getAgentsByUserIdHandler)(req, res);
});
// Create new agent
router.post("/", async (req, res) => {
    await (0, agent_controller_1.createAIAgentHandler)(req, res);
});
exports.default = router;
