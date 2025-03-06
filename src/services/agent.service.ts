import { db } from "../config/firebase";
import { AIAgent } from "../models/agent";
import { getUserByWalletAddress } from "./user.service";

export const getAgentsByUserId = async (userId: string): Promise<AIAgent[]> => {
  const agentsSnapshot = await db
    .collection("agents")
    .where("userId", "==", userId)
    .get();

  if (agentsSnapshot.empty) {
    return [];
  }

  const agents: AIAgent[] = agentsSnapshot.docs.map(
    (doc) => doc.data() as AIAgent
  );
  return agents;
};

export const createAIAgent = async (
  agentData: AIAgent
): Promise<AIAgent | null> => {
  // Fetch the user from Firebase by userId
  const user = await getUserByWalletAddress(agentData.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const newAgent: AIAgent = {
    ...agentData,
    user, // Store full user object
  };

  const agentRef = await db.collection("agents").add(newAgent);
  return { ...newAgent };
};
