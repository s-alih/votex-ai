"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    await (0, user_controller_1.createUserHandler)(req, res);
});
router.get("/wallet/:walletAddress", async (req, res) => {
    await (0, user_controller_1.getUserByWalletHandler)(req, res);
});
exports.default = router;
