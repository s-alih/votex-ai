import { proposalsRef } from "../config";
import { Proposal } from "../models/proposal";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { getDAOById } from "./daoService";

dotenv.config();

// Interface for better type safety and function encoding
const GOVERNANCE_INTERFACE = new ethers.Interface([
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
const GOVERNANCE_CONTRACT_ADDRESS =
  "0x83CFae0595557a5ef25643E83eCd9c6AC459F94A";

// get proposal by id
export async function getProposal(id: string): Promise<Proposal> {
  const doc = await proposalsRef.doc(id).get();
  return doc.data() as Proposal;
}

export async function updateProposal(proposal: Proposal): Promise<void> {
  await proposalsRef.doc(proposal.id).update({
    ...proposal,
    updatedAt: new Date(),
  });
}

// updta

export async function createNewProposal(
  title: string,
  description: string,
  daoId: string
) {
  try {
    // Create a wallet instance using the private key
    const privateKey =
      process.env.PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Wallet private key not found in environment variables");
    }

    // Validate inputs
    if (!title || !description || !daoId) {
      throw new Error("Both title and description are required");
    }

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.SONIC_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const dao = await getDAOById(daoId);

    if (!dao) {
      throw new Error("DAO not found");
    }

    // Create contract instance using Interface
    const contract = new ethers.Contract(
      dao.governanceContractAddress,
      GOVERNANCE_INTERFACE,
      wallet
    );

    console.log("Creating proposal:", { title, description });
    console.log("Wallet address:", wallet.address);
    console.log("Contract address:", dao.governanceContractAddress);

    // Encode function data manually to verify it's correct
    const encodedData = GOVERNANCE_INTERFACE.encodeFunctionData(
      "createProposal",
      [title, description]
    );
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
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = GOVERNANCE_INTERFACE.parseLog(log);
        return parsed?.name === "ProposalCreated";
      } catch {
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

    const [proposalId, proposalTitle, proposalDescription, proposer] =
      parsedLog.args;
    console.log("Proposal created successfully:", {
      id: proposalId.toString(),
      title: proposalTitle,
      description: proposalDescription,
      proposer,
    });
    return proposalId.toString();
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
}

export async function getProposalsByUserId(
  userId: string
): Promise<Proposal[]> {
  const proposals = await proposalsRef.where("userId", "==", userId).get();
  return proposals.docs.map((doc) => doc.data() as Proposal);
}

export async function getActiveProposals(): Promise<Proposal[]> {
  try {
    const now = new Date();
    console.log("Fetching active proposals, current time:", now);

    const proposalsSnapshot = await proposalsRef
      .where("deadline", ">", now)
      .where("executed", "==", false)
      .orderBy("deadline", "asc")
      .get();

    console.log("Found proposals count:", proposalsSnapshot.size);

    return proposalsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Proposal[];
  } catch (error) {
    console.error("Error fetching active proposals:", error);
    throw error;
  }
}

export async function createTestProposal(daoId: string): Promise<string> {
  try {
    const now = new Date();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // Set deadline to 7 days from now

    const proposalData: Proposal = {
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

    const docRef = await proposalsRef.add(proposalData);
    await proposalsRef.doc(docRef.id).update({ id: docRef.id });

    console.log("Created test proposal:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating test proposal:", error);
    throw error;
  }
}

export async function getAllProposals(): Promise<Proposal[]> {
  const proposals = await proposalsRef.get();
  return proposals.docs.map((doc) => doc.data() as Proposal);
}
