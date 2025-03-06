import { db } from "../config/firebase";
import { User } from "../models/user";

export const createUser = async (userData: User): Promise<string> => {
  const userRef = db.collection("users").doc(userData.walletAddress);
  await userRef.set(userData);
  return userRef.id;
};

export const getUserByWalletAddress = async (
  walletAddress: string
): Promise<User | null> => {
  const userSnapshot = await db
    .collection("users")
    .where("walletAddress", "==", walletAddress)
    .get();

  if (userSnapshot.empty) {
    return null;
  }

  // Assuming walletAddress is unique, get the first matching document
  const user = userSnapshot.docs[0].data() as User;
  return user;
};
