import { db } from "./firebase";

export const proposalsRef = db.collection("proposals");
export const agentsRef = db.collection("agents");
export const votesRef = db.collection("votes");
export const usersRef = db.collection("users");
export const daosRef = db.collection("daos");
