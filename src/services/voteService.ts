import { db } from "../config/firebase";
import { Vote } from "../models/vote";

const votesRef = db.collection("votes");

export async function getVotesByUserId(userId: string): Promise<Vote[]> {
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
      } as Vote;
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    throw error;
  }
}
