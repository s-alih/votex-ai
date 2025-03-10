"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVotesByUserId = getVotesByUserId;
const firebase_1 = require("../config/firebase");
const votesRef = firebase_1.db.collection("votes");
async function getVotesByUserId(userId) {
    try {
        const votesSnapshot = await votesRef
            .where("userId", "==", userId)
            .orderBy("timestamp", "desc")
            .get();
        return votesSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
            };
        });
    }
    catch (error) {
        console.error("Error fetching votes:", error);
        throw error;
    }
}
