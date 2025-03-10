"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  Link,
  ExternalLink,
  CheckCircle,
  XCircle,
  Brain,
  ArrowRight,
  Vote,
  Coins,
} from "lucide-react";
import {
  useAccount,
  useBalance,

} from "wagmi";
import {
  parseEther,
  formatEther,
  createPublicClient,
  http,
} from "viem";
import { erc20Abi } from "viem";
import { sonicTestnet } from "@/config/chains";
import type { Transaction as ViemTransaction, Block } from "viem";

interface DAOMembership {
  id: string;
  name: string;
  tokenAddress: string;
  tokenSymbol: string;
  governanceContractAddress: string;
}

interface User {
  walletAddress: string;
  agentWallet: string;
  agentWalletPrivateKey: string;
  daoMemberships: DAOMembership[];
  createdAt: any;
  updatedAt: any;
}

interface DAOToken {
  name: string;
  symbol: string;
  address: string;
  balance: string;
  votingPower: "High" | "Medium" | "Low";
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: "success" | "pending" | "failed";
  hash: string;
}

export default function WalletView() {
  const { address } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [daoTokens, setDaoTokens] = useState<DAOToken[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Monitor transactions state
  useEffect(() => {
    console.log("Transactions state updated:", transactions);
  }, [transactions]);

  // Get native token (S) balance for user wallet
  const { data: userBalance } = useBalance({
    address: address as `0x${string}`,
  });

  // Get native token (S) balance for agent wallet
  const { data: agentBalance } = useBalance({
    address: user?.agentWallet as `0x${string}` | undefined,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (address) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/wallet/${address}`
          );
          if (response.ok) {
            const { user: userData } = await response.json();
            setUser(userData);

            // Process DAO tokens from user memberships
            if (userData.daoMemberships) {
              const tokens = userData.daoMemberships.map(
                (dao: DAOMembership) => {
                  return {
                    name: dao.name,
                    symbol: dao.tokenSymbol,
                    address: dao.tokenAddress,
                    balance: "0", // Will be updated by useContractRead
                    votingPower: "Medium" as const,
                  };
                }
              );
              setDaoTokens(tokens);
            }

            // Fetch transactions for both wallets
            const client = createPublicClient({
              chain: sonicTestnet,
              transport: http(),
            });

            // Get the latest block
            const latestBlock = await client.getBlockNumber();
            console.log("Latest block:", latestBlock);

            // Get last 10 blocks
            const blocks = await Promise.all(
              Array.from({ length: 10 }, (_, i) =>
                client.getBlock({
                  blockNumber: latestBlock - BigInt(i),
                  includeTransactions: true,
                })
              )
            );

            // Collect all transactions from blocks
            const allTransactions = blocks.flatMap(
              (block) => block.transactions
            );
            console.log("Total transactions found:", allTransactions.length);

            // Filter and process transactions
            const processedTxs = await Promise.all(
              allTransactions
                .filter((tx: ViemTransaction) => {
                  if (typeof tx === "string") return false;
                  const matches =
                    tx.from.toLowerCase() === address?.toLowerCase() ||
                    tx.to?.toLowerCase() === address?.toLowerCase() ||
                    tx.from.toLowerCase() ===
                      userData.agentWallet?.toLowerCase() ||
                    tx.to?.toLowerCase() ===
                      userData.agentWallet?.toLowerCase();

                  console.log("Checking transaction:", {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    matches,
                    userWallet: address?.toLowerCase(),
                    agentWallet: userData.agentWallet?.toLowerCase(),
                  });
                  return matches;
                })
                .map(async (tx: ViemTransaction) => {
                  if (typeof tx === "string") return null;
                  if (!tx.to) return null;

                  try {
                    const receipt = await client.getTransactionReceipt({
                      hash: tx.hash,
                    });
                    console.log("Got receipt for tx:", {
                      hash: tx.hash,
                      status: receipt.status,
                    });

                    const isDeposit =
                      tx.to.toLowerCase() ===
                      userData.agentWallet?.toLowerCase();
                    const isWithdraw =
                      tx.from.toLowerCase() ===
                      userData.agentWallet?.toLowerCase();

                    const transaction: Transaction = {
                      id: tx.hash,
                      date: new Date().toISOString(),
                      type: isDeposit
                        ? "Deposit to Agent"
                        : isWithdraw
                        ? "Withdraw from Agent"
                        : "Transfer",
                      amount: `${formatEther(tx.value)} S`,
                      status:
                        receipt.status === "success" ? "success" : "failed",
                      hash: tx.hash,
                    };
                    console.log("Created transaction object:", transaction);
                    return transaction;
                  } catch (error) {
                    console.error("Error getting transaction receipt:", error);
                    return null;
                  }
                })
            );

            // Filter out null values and sort by date
            const formattedTxs = processedTxs
              .filter((tx): tx is Transaction => tx !== null)
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

            console.log("Final transactions to display:", formattedTxs);
            setTransactions(formattedTxs);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, [address]);

  // Fetch token balances using useContractRead
  useEffect(() => {
    const fetchBalances = async () => {
      const client = createPublicClient({
        chain: sonicTestnet,
        transport: http(),
      });

      const updatedTokens = await Promise.all(
        daoTokens.map(async (token) => {
          try {
            const balance = await client.readContract({
              address: token.address as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address as `0x${string}`],
            });

            return {
              ...token,
              balance: formatEther(balance),
              // Calculate voting power based on balance
              votingPower: calculateVotingPower(balance),
            };
          } catch (error) {
            console.error(`Error fetching balance for ${token.name}:`, error);
            return token;
          }
        })
      );

      setDaoTokens(updatedTokens);
    };

    if (daoTokens.length > 0 && address) {
      fetchBalances();
    }
  }, [daoTokens.length, address]);

  // Helper function to calculate voting power based on balance
  const calculateVotingPower = (balance: bigint): "High" | "Medium" | "Low" => {
    const balanceNumber = Number(formatEther(balance));
    if (balanceNumber >= 1000) return "High";
    if (balanceNumber >= 100) return "Medium";
    return "Low";
  };

  const handleDeposit = async () => {
    if (!user?.agentWallet || !depositAmount) return;

    try {
      // Send native token (S) to agent wallet
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: user.agentWallet,
            value: parseEther(depositAmount).toString(16), // Convert to hex
          },
        ],
      });

      // Add transaction to local state
      const newTx: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: "Deposit to Agent",
        amount: `${depositAmount} S`,
        status: "pending",
        hash: tx as string,
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Reset input
      setDepositAmount("");
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 backdrop-blur-xl bg-background/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold"> Wallet</h2>
                <p className="text-muted-foreground">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-background/30">
              <Link className="mr-2 h-4 w-4" />
              Connected
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 backdrop-blur-xl bg-background/30">
                <h3 className="text-sm text-muted-foreground mb-2">
                  S Balance
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {userBalance?.formatted || "0.00"}
                  </span>
                  <span className="text-sm font-semibold text-primary">S</span>
                </div>
              </Card>

              <div className="p-4 space-y-4 backdrop-blur-xl bg-background/30 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center">
                    <Vote className="h-5 w-5 mr-2 text-primary" />
                    Governance Tokens
                  </h3>
                  <Badge className="bg-primary/20">Active Voting Power</Badge>
                </div>

                <div className="space-y-3">
                  {daoTokens.map((token) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/20"
                    >
                      <div>
                        <p className="font-medium">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{token.balance}</p>
                        <p className="text-sm text-primary">{token.symbol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-background/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-secondary" />
              <div>
                <h2 className="text-2xl font-bold"> Agent Wallet</h2>
                <p className="text-muted-foreground">
                  {user?.agentWallet
                    ? `${user.agentWallet.slice(
                        0,
                        6
                      )}...${user.agentWallet.slice(-4)}`
                    : "Not created"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/20">
              <Brain className="mr-2 h-4 w-4" />
              {user?.agentWallet ? "Active" : "Not Created"}
            </Badge>
          </div>

          <div className="space-y-6">
            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">
                Agent Balance
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {agentBalance?.formatted || "0.00"}
                </span>
                <span className="text-sm font-semibold text-primary">S</span>
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold">Deposit to AI Agent</h3>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount of S"
                  className="bg-background/30"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleDeposit}
                  disabled={!user?.agentWallet || !depositAmount}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 backdrop-blur-xl bg-background/30">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Explorer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-primary/20">
                    {tx.status === "success" && (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    )}
                    {tx.status === "pending" && (
                      <ArrowRight className="mr-1 h-3 w-3" />
                    )}
                    {tx.status === "failed" && (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://explorer.sonic.oasys.games/tx/${tx.hash}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
