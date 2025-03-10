"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVotesByAgentId = exports.getVotesByUserId = void 0;
const firebase_1 = require("../config/firebase");
const getVotesByUserId = async (userId) => {
    const votesSnapshot = await firebase_1.db
        .collection("votes")
        .where("userId", "==", userId)
        .get();
    if (votesSnapshot.empty) {
        return [];
    }
    const votes = votesSnapshot.docs.map((doc) => doc.data());
    return votes;
};
exports.getVotesByUserId = getVotesByUserId;
const getVotesByAgentId = async (agentId) => {
    const votesSnapshot = await firebase_1.db
        .collection("votes")
        .where("agentId", "==", agentId)
        .get();
    if (votesSnapshot.empty) {
        return [];
    }
    const votes = votesSnapshot.docs.map((doc) => doc.data());
    return votes;
};
exports.getVotesByAgentId = getVotesByAgentId;
