"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByWalletAddress = exports.createUser = void 0;
const firebase_1 = require("../config/firebase");
const createUser = async (userData) => {
    const userRef = firebase_1.db.collection("users").doc(userData.walletAddress);
    await userRef.set(userData);
    return userRef.id;
};
exports.createUser = createUser;
const getUserByWalletAddress = async (walletAddress) => {
    const userSnapshot = await firebase_1.db
        .collection("users")
        .where("walletAddress", "==", walletAddress)
        .get();
    if (userSnapshot.empty) {
        return null;
    }
    // Assuming walletAddress is unique, get the first matching document
    const user = userSnapshot.docs[0].data();
    return user;
};
exports.getUserByWalletAddress = getUserByWalletAddress;
