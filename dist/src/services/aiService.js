"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAgents = fetchAgents;
exports.callAIForVoting = callAIForVoting;
const config_1 = require("../config");
const chromaService_1 = require("./chromaService");
const geminiService_1 = require("./geminiService");
const firebase_1 = require("../config/firebase");
async function fetchAgents(daoId) {
    const snapshot = await config_1.agentsRef.where("daoId", "==", daoId).get();
    return snapshot.docs.map((doc) => doc.data());
}
async function callAIForVoting(proposal, agent) {
    try {
        console.log(`🤖 AI Agent for ${agent.user.walletAddress} analyzing proposal ${proposal.id}`);
        const chromaService = new chromaService_1.ChromaService();
        const geminiService = new geminiService_1.GeminiService(process.env.GOOGLE_API_KEY || "");
        // Get relevant historical votes
        const historicalVotesResponse = await chromaService.queryHistoricalVotes(proposal.description);
        const historicalVotes = historicalVotesResponse.metadatas || [];
        // Get user's voting history
        const userVotesResponse = await chromaService.getUserVotingHistory(agent.userId, proposal.description);
        const userVotes = userVotesResponse.metadatas || [];
        // Analyze proposal using Gemini
        const analysis = await geminiService.analyzeProposal(proposal, agent, historicalVotes, userVotes);
        console.log("Analysis:", analysis);
        // Create vote record
        const vote = {
            id: `${proposal.id}_${agent.userId}`,
            proposalId: proposal.id,
            proposal: proposal,
            userId: agent.userId,
            agentId: agent.id || "",
            dao: agent.dao,
            user: agent.user,
            agent: agent,
            voteType: analysis.voteType,
            isVoted: true,
            suggestedVote: analysis.voteType,
            voteReason: analysis.voteReason,
            voteExplanation: analysis.voteExplanation,
            aiAnalysis: analysis.aiAnalysis,
            timestamp: Date.now(),
        };
        // Store vote in Firestore
        await firebase_1.db.collection("votes").doc(vote.id).set(vote);
        // Store vote in ChromaDB for future reference
        await chromaService.storeUserVote(agent.userId, vote);
        console.log({
            proposalId: proposal.id,
            agentId: agent.userId,
            vote: analysis.voteType,
            reason: analysis.voteReason,
        });
    }
    catch (error) {
        console.error(`Error in AI voting for proposal ${proposal.id}:`, error);
        throw error;
    }
}
