"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDAOsHandler = exports.getDAOByIdHandler = exports.createDAOHandler = void 0;
const daoService_1 = require("../services/daoService");
const createDAOHandler = (req, res) => {
    try {
        const { name, imageUrl, tokenAddress, tokenSymbol, governanceContractAddress, description, } = req.body;
        if (!name || !tokenAddress || !tokenSymbol || !governanceContractAddress) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const newDAO = (0, daoService_1.createDAO)({
            name,
            imageUrl,
            tokenAddress,
            tokenSymbol,
            governanceContractAddress,
            description,
        });
        res.status(201).json(newDAO);
    }
    catch (error) {
        console.error("Error creating DAO:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createDAOHandler = createDAOHandler;
const getDAOByIdHandler = (req, res) => {
    try {
        const { id } = req.params;
        const dao = (0, daoService_1.getDAOById)(id);
        if (!dao) {
            return res.status(404).json({ error: "DAO not found" });
        }
        res.status(200).json(dao);
    }
    catch (error) {
        console.error("Error fetching DAO:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getDAOByIdHandler = getDAOByIdHandler;
const getAllDAOsHandler = async (req, res) => {
    try {
        console.log("Getting all DAOs...");
        const daos = await (0, daoService_1.getAllDAOs)();
        console.log("Found DAOs:", daos.length);
        res.status(200).json({ daos });
    }
    catch (error) {
        console.error("Error fetching DAOs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAllDAOsHandler = getAllDAOsHandler;
