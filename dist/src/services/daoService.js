"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDAO = exports.updateDAO = exports.getAllDAOs = exports.getDAOById = exports.createDAO = void 0;
const firebase_1 = require("../config/firebase");
const createDAO = async (daoData) => {
    const daoRef = firebase_1.db.collection("daos").doc();
    const cleanData = Object.fromEntries(Object.entries(daoData).filter(([_, v]) => v !== undefined));
    const newDAO = {
        id: daoRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...cleanData,
    };
    await daoRef.set(newDAO);
    return newDAO;
};
exports.createDAO = createDAO;
const getDAOById = async (id) => {
    const daoDoc = await firebase_1.db.collection("daos").doc(id).get();
    if (!daoDoc.exists)
        return null;
    return daoDoc.data();
};
exports.getDAOById = getDAOById;
const getAllDAOs = async () => {
    const daosSnapshot = await firebase_1.db.collection("daos").get();
    console.log("daosSnapshot", daosSnapshot.docs);
    return daosSnapshot.docs.map((doc) => doc.data());
};
exports.getAllDAOs = getAllDAOs;
const updateDAO = async (id, daoData) => {
    const daoRef = firebase_1.db.collection("daos").doc(id);
    await daoRef.update({
        ...daoData,
        updatedAt: new Date(),
    });
};
exports.updateDAO = updateDAO;
const deleteDAO = async (id) => {
    await firebase_1.db.collection("daos").doc(id).delete();
};
exports.deleteDAO = deleteDAO;
