"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
const dotenv = require("dotenv");
dotenv.config();
const config = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        sonicTestnet: {
            url: "https://rpc.blaze.soniclabs.com",
            chainId: 57054,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
};
exports.default = config;
// npx hardhat run --network sonicTestnet scripts/deploy.ts
