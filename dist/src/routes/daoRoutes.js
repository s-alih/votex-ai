"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const daoController_1 = require("../controllers/daoController");
const router = express.Router();
// Get all DAOs - this must come before the :id route
router.get("/all", async (req, res) => {
    console.log("GET /api/dao/all");
    await (0, daoController_1.getAllDAOsHandler)(req, res);
});
// Create new DAO
router.post("/", async (req, res) => {
    await (0, daoController_1.createDAOHandler)(req, res);
});
// Get DAO by ID
router.get("/:id", async (req, res) => {
    await (0, daoController_1.getDAOByIdHandler)(req, res);
});
exports.default = router;
