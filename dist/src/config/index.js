"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daosRef = exports.usersRef = exports.votesRef = exports.agentsRef = exports.proposalsRef = void 0;
const firebase_1 = require("./firebase");
exports.proposalsRef = firebase_1.db.collection("proposals");
exports.agentsRef = firebase_1.db.collection("agents");
exports.votesRef = firebase_1.db.collection("votes");
exports.usersRef = firebase_1.db.collection("users");
exports.daosRef = firebase_1.db.collection("daos");
