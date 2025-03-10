"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDelegationHandler = exports.createAIAgentHandler = exports.getAgentsByUserIdHandler = void 0;
const agent_service_1 = require("../services/agent.service");
const user_service_1 = require("../services/user.service");
const daoService_1 = require("../services/daoService");
const embeddingService_1 = require("../services/embeddingService");
const dotenv = require("dotenv");
dotenv.config();
const embeddingService = new embeddingService_1.EmbeddingService(process.env.GOOGLE_API_KEY || "");
const getAgentsByUserIdHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const agents = await (0, agent_service_1.getAgentsByUserId)(userId);
        res.status(200).json({ agents });
    }
    catch (error) {
        console.error("Error fetching AI agents:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAgentsByUserIdHandler = getAgentsByUserIdHandler;
const createAIAgentHandler = async (req, res) => {
    try {
        const { userId, daoId, isAutoVoteEnabled, governanceStrategy, riskProfile, voteAlignment, } = req.body;
        if (!userId ||
            !daoId ||
            !governanceStrategy ||
            !riskProfile ||
            !voteAlignment) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const user = await (0, user_service_1.getUserByWalletAddress)(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const dao = await (0, daoService_1.getDAOById)(daoId);
        if (!dao) {
            return res.status(404).json({ error: "DAO not found" });
        }
        const preferencesEmbedding = await embeddingService.generateEmbedding(`dao: ${dao.name}
      governanceStrategy: ${governanceStrategy}
      Risk Profile Percentile: ${riskProfile}
      voteAlignment: ${voteAlignment}`);
        const agentData = {
            userId,
            daoId,
            isAutoVoteEnabled,
            preferencesEmbedding,
            governanceStrategy,
            riskProfile,
            voteAlignment,
            user,
            dao,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const agent = await (0, agent_service_1.createAIAgent)(agentData);
        res.status(201).json({ agent });
    }
    catch (error) {
        console.error("Error creating AI Agent:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.createAIAgentHandler = createAIAgentHandler;
// Agent. isAutoVoteEnabled: boolean;
const toggleDelegationHandler = async (req, res) => {
    try {
        const { userId, agentId } = req.body;
        if (!userId || !agentId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // get the agent by id and upate isAutoVoteEnabled to the opposite of what it is
        const agent = await (0, agent_service_1.getAgentById)(agentId);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        const updatedAgent = await (0, agent_service_1.updateAgent)(agentId, {
            isAutoVoteEnabled: !agent.isAutoVoteEnabled,
        });
        res.status(200).json({ agent: updatedAgent });
    }
    catch (error) {
        console.error("Error toggling delegation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.toggleDelegationHandler = toggleDelegationHandler;
