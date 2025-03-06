import { db } from "../config/firebase";
import { DAO } from "../models/dao";

export const createDAO = async (
  daoData: Omit<DAO, "id" | "createdAt" | "updatedAt">
): Promise<DAO> => {
  const daoRef = db.collection("daos").doc();
  const cleanData = Object.fromEntries(
    Object.entries(daoData).filter(([_, v]) => v !== undefined)
  ) as Omit<DAO, "id" | "createdAt" | "updatedAt">;
  const newDAO: DAO = {
    id: daoRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...cleanData,
  };
  await daoRef.set(newDAO);
  return newDAO;
};

export const getDAOById = async (id: string): Promise<DAO | null> => {
  const daoDoc = await db.collection("daos").doc(id).get();
  if (!daoDoc.exists) return null;
  return daoDoc.data() as DAO;
};

export const getAllDAOs = async (): Promise<DAO[]> => {
  const daosSnapshot = await db.collection("daos").get();
  return daosSnapshot.docs.map((doc) => doc.data() as DAO);
};

export const updateDAO = async (
  id: string,
  daoData: Partial<DAO>
): Promise<void> => {
  const daoRef = db.collection("daos").doc(id);
  await daoRef.update({
    ...daoData,
    updatedAt: new Date(),
  });
};

export const deleteDAO = async (id: string): Promise<void> => {
  await db.collection("daos").doc(id).delete();
};
