import { db } from "../config/firebase";
import { Vote } from "../models/vote";

export const getVotesByUserId = async (userId: string): Promise<Vote[]> => {
  const votesSnapshot = await db
    .collection("votes")
    .where("userId", "==", userId)
    .get();

  if (votesSnapshot.empty) {
    return [];
  }

  const votes: Vote[] = votesSnapshot.docs.map((doc) => doc.data() as Vote);
  return votes;
};
