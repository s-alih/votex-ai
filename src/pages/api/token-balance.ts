import { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http, getContract } from "viem";
import { sonicTestnet } from "@/config/chains";
import { erc20Abi } from "viem";

const client = createPublicClient({
  chain: sonicTestnet,
  transport: http(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { address, tokenAddress } = req.query;

  if (!address || !tokenAddress) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Create contract instance
    const contract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      publicClient: client,
    });

    // Get balance
    const balance = await contract.read.balanceOf([address as `0x${string}`]);

    return res.status(200).json({ balance: balance.toString() });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return res.status(500).json({ message: "Error fetching token balance" });
  }
}
