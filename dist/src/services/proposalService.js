"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposal = getProposal;
exports.updateProposal = updateProposal;
exports.createNewProposal = createNewProposal;
exports.getProposalsByUserId = getProposalsByUserId;
exports.getActiveProposals = getActiveProposals;
exports.createTestProposal = createTestProposal;
exports.getAllProposals = getAllProposals;
const config_1 = require("../config");
const ethers_1 = require("ethers");
const dotenv = require("dotenv");
const daoService_1 = require("./daoService");
dotenv.config();
// Interface for better type safety and function encoding
const GOVERNANCE_INTERFACE = new ethers_1.ethers.Interface([
    "function createProposal(string _title, string _description) external",
    "function vote(uint256 _proposalId, bool _vote) external",
    "function executeProposal(uint256 _proposalId) external",
    "function proposalCount() public view returns (uint256)",
    "function governanceToken() public view returns (address)",
    "event ProposalCreated(uint256 id, string title, string description, address proposer)",
]);
const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)",
];
// Hardcode the contract address for now to ensure it's correct
const GOVERNANCE_CONTRACT_ADDRESS = "0x83CFae0595557a5ef25643E83eCd9c6AC459F94A";
// get proposal by id
async function getProposal(id) {
    const doc = await config_1.proposalsRef.doc(id).get();
    return doc.data();
}
async function updateProposal(proposal) {
    await config_1.proposalsRef.doc(proposal.id).update({
        ...proposal,
        updatedAt: new Date(),
    });
}
// updta
async function createNewProposal(title, description, daoId) {
    try {
        // Create a wallet instance using the private key
        const privateKey = process.env.PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("Wallet private key not found in environment variables");
        }
        // Validate inputs
        if (!title || !description || !daoId) {
            throw new Error("Both title and description are required");
        }
        // Create provider and signer
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);
        const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
        const dao = await (0, daoService_1.getDAOById)(daoId);
        if (!dao) {
            throw new Error("DAO not found");
        }
        // Create contract instance using Interface
        const contract = new ethers_1.ethers.Contract(dao.governanceContractAddress, GOVERNANCE_INTERFACE, wallet);
        console.log("Creating proposal:", { title, description });
        console.log("Wallet address:", wallet.address);
        console.log("Contract address:", dao.governanceContractAddress);
        // Encode function data manually to verify it's correct
        const encodedData = GOVERNANCE_INTERFACE.encodeFunctionData("createProposal", [title, description]);
        console.log("Encoded function data:", encodedData);
        // Create the proposal
        const tx = await contract.createProposal(title, description, {
            gasLimit: 500000,
        });
        console.log("Transaction sent:", tx.hash);
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction receipt:", {
            status: receipt.status,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber,
        });
        if (receipt.status === 0) {
            throw new Error("Transaction failed");
        }
        // Get the proposal ID from the event
        const event = receipt.logs.find((log) => {
            try {
                const parsed = GOVERNANCE_INTERFACE.parseLog(log);
                return parsed?.name === "ProposalCreated";
            }
            catch {
                return false;
            }
        });
        if (!event) {
            throw new Error("ProposalCreated event not found in transaction receipt");
        }
        const parsedLog = GOVERNANCE_INTERFACE.parseLog(event);
        if (!parsedLog) {
            throw new Error("Failed to parse ProposalCreated event log");
        }
        const [proposalId, proposalTitle, proposalDescription, proposer] = parsedLog.args;
        console.log("Proposal created successfully:", {
            id: proposalId.toString(),
            title: proposalTitle,
            description: proposalDescription,
            proposer,
        });
        return proposalId.toString();
    }
    catch (error) {
        console.error("Error creating proposal:", error);
        throw error;
    }
}
async function getProposalsByUserId(userId) {
    const proposals = await config_1.proposalsRef.where("userId", "==", userId).get();
    return proposals.docs.map((doc) => doc.data());
}
async function getActiveProposals() {
    try {
        const now = new Date();
        console.log("Fetching active proposals, current time:", now);
        const proposalsSnapshot = await config_1.proposalsRef
            .where("deadline", ">", now)
            .where("executed", "==", false)
            .orderBy("deadline", "asc")
            .get();
        console.log("Found proposals count:", proposalsSnapshot.size);
        return proposalsSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));
    }
    catch (error) {
        console.error("Error fetching active proposals:", error);
        throw error;
    }
}
async function createTestProposal(daoId) {
    try {
        const now = new Date();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7); // Set deadline to 7 days from now
        const proposalData = {
            id: "", // Will be set after creation
            daoId: daoId,
            dao: {
                id: daoId,
                name: "WaveForceDAO",
                imageUrl: "https://picsum.photos/200",
                tokenAddress: "0xd18335B9e5D354354Fab33b8377E464d60CdF74e",
                tokenSymbol: "WAVE",
                governanceContractAddress: "0x3BA8aE675ab5c19579dc7144635e39c5418252EB",
                description: "WaveForceDAO Description",
                createdAt: now,
                updatedAt: now,
            },
            daoName: "WaveForceDAO",
            proposer: "0x1459ca34BC6BAeD78557801605Fe8487777b30e1",
            title: "Test Proposal",
            description: "This is a test proposal for development",
            deadline: deadline,
            votesFor: 100,
            votesAgainst: 50,
            executed: false,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await config_1.proposalsRef.add(proposalData);
        await config_1.proposalsRef.doc(docRef.id).update({ id: docRef.id });
        console.log("Created test proposal:", docRef.id);
        return docRef.id;
    }
    catch (error) {
        console.error("Error creating test proposal:", error);
        throw error;
    }
}
async function getAllProposals() {
    const proposals = await config_1.proposalsRef.get();
    return proposals.docs.map((doc) => doc.data());
}
