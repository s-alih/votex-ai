import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // // Deploy VotexToken
  // const initialSupply = 1000000; // 1 million tokens
  // const VotexToken = await ethers.getContractFactory("VotexToken");
  // const votexToken = await VotexToken.deploy(initialSupply);
  // await votexToken.waitForDeployment();
  // console.log("VotexToken deployed to:", await votexToken.getAddress());

  // Deploy VotexAIGovernance
  const VotexAIGovernance = await ethers.getContractFactory(
    "VotexAIGovernance"
  );
  const votexAIGovernance = await VotexAIGovernance.deploy(
    "0xd18335B9e5D354354Fab33b8377E464d60CdF74e"
  );
  await votexAIGovernance.waitForDeployment();
  console.log(
    "VotexAIGovernance deployed to:",
    await votexAIGovernance.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
