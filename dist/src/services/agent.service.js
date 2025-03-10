"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentById = exports.updateAgent = exports.createAIAgent = exports.getAgentsByUserId = void 0;
const firebase_1 = require("../config/firebase");
const user_service_1 = require("./user.service");
const getAgentsByUserId = async (userId) => {
    const agentsSnapshot = await firebase_1.db
        .collection("agents")
        .where("userId", "==", userId)
        .get();
    if (agentsSnapshot.empty) {
        return [];
    }
    const agents = agentsSnapshot.docs.map((doc) => doc.data());
    return agents;
};
exports.getAgentsByUserId = getAgentsByUserId;
const createAIAgent = async (agentData) => {
    // Fetch the user from Firebase by userId
    const user = await (0, user_service_1.getUserByWalletAddress)(agentData.userId);
    if (!user) {
        throw new Error("User not found");
    }
    const newAgent = {
        ...agentData,
        id: `${agentData.daoId}-${agentData.userId}`,
        user, // Store full user object
    };
    const agentRef = await firebase_1.db.collection("agents").add(newAgent);
    return { ...newAgent };
};
exports.createAIAgent = createAIAgent;
const updateAgent = async (agentId, agentData) => {
    const agentRef = firebase_1.db.collection("agents").doc(agentId);
    const doc = await agentRef.get();
    if (!doc.exists) {
        throw new Error("Agent not found");
    }
    const currentAgent = doc.data();
    const updatedAgent = {
        ...currentAgent,
        ...agentData,
    };
    await agentRef.set(updatedAgent);
    return updatedAgent;
};
exports.updateAgent = updateAgent;
const getAgentById = async (agentId) => {
    const agentRef = firebase_1.db.collection("agents").doc(agentId);
    const doc = await agentRef.get();
    if (!doc.exists) {
        return null;
    }
    return doc.data();
};
exports.getAgentById = getAgentById;
