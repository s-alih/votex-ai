"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    // Deploy VotexToken
    const initialSupply = 1000000; // 1 million tokens
    const VotexToken = await hardhat_1.ethers.getContractFactory("VotexToken");
    const votexToken = await VotexToken.deploy(initialSupply);
    await votexToken.waitForDeployment();
    console.log("VotexToken deployed to:", await votexToken.getAddress());
    // Deploy VotexAIGovernance
    const VotexAIGovernance = await hardhat_1.ethers.getContractFactory("VotexAIGovernance");
    const votexAIGovernance = await VotexAIGovernance.deploy(await votexToken.getAddress());
    await votexAIGovernance.waitForDeployment();
    console.log("VotexAIGovernance deployed to:", await votexAIGovernance.getAddress());
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
