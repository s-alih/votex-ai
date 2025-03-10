"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ChartBar,
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Scale,
  BarChart,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { useContractWrite, useAccount } from "wagmi";
import { parseAbiItem } from "viem";

export interface Vote {
  id: string;
  proposalId: string;
  dao?: {
    id: string;
    name: string;
    imageUrl: string;
    tokenSymbol: string;
  };
  userId?: string;
  agentId?: string;
  voteType?: "FOR" | "AGAINST";
  isVoted: boolean;
  suggestedVote?: "FOR" | "AGAINST";
  voteReason?: string;
  voteExplanation?: string;
  aiAnalysis?: string;
  timestamp: number;
  txHash?: string;
  agent?: any;
  user?: any;
}

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

// Add a helper function to convert Firestore timestamp to Date
function convertToDate(deadline: FirestoreTimestamp | string | Date): Date {
  if (typeof deadline === "string") {
    return new Date(deadline);
  }
  if (deadline instanceof Date) {
    return deadline;
  }
  if (deadline && "_seconds" in deadline) {
    return new Date(deadline._seconds * 1000);
  }
  return new Date();
}

export interface Proposal {
  id: string;
  daoId: string;
  title: string;
  description: string;
  deadline: any;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  dao: {
    name: string;
    imageUrl: string;
    governanceContractAddress: string;
  };
}

interface ProposalViewProps {
  proposal: Proposal;
  vote?: Vote;
  votes?: Vote[];
  onBack: () => void;
}

// Add ABI for the vote function
const votexAIAbi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_vote",
        type: "bool",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function ProposalView({
  proposal,
  vote,
  votes = [], // Default to empty array if not provided
  onBack,
}: ProposalViewProps) {
  const { address } = useAccount();

  // Extract numeric ID from the proposal ID string
  const getNumericId = (proposalId: string) => {
    const match = proposalId.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const { data, error, isPending, writeContract } = useContractWrite();

  const handleVote = async (voteFor: boolean) => {
    try {
      const numericId = getNumericId(proposal.id);
      console.log("Voting on proposal:", numericId, "Vote:", voteFor);

      const result = await writeContract({
        abi: votexAIAbi,
        address: proposal.dao.governanceContractAddress as `0x${string}`,
        functionName: "vote",
        args: [BigInt(numericId), voteFor],
      });

      console.log("Transaction submitted:", result);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Add debug logging
  console.log("ProposalView - Proposal:", proposal);
  console.log("ProposalView - Vote data received:", vote);

  useEffect(() => {
    console.log("Vote data changed:", vote);
  }, [vote]);

  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage =
    totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;

  // Early check for vote data
  const hasVoteData =
    vote &&
    (vote.voteType ||
      vote.suggestedVote ||
      vote.voteReason ||
      vote.aiAnalysis ||
      vote.voteExplanation);

  console.log("Has vote data:", hasVoteData, vote);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 hover:bg-primary/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="p-6 backdrop-blur-xl bg-background/30">
        <div className="space-y-6">
          <div>
            {hasVoteData && (
              <div className="flex items-center space-x-3 mb-4">
                <Badge
                  variant={
                    (vote.voteType || vote.suggestedVote) === "FOR"
                      ? "default"
                      : "destructive"
                  }
                  className={`${
                    (vote.voteType || vote.suggestedVote) === "FOR"
                      ? "bg-primary/20"
                      : "bg-destructive/20"
                  } text-lg py-2`}
                >
                  <Brain className="mr-2 h-5 w-5" />
                  AI {vote.isVoted ? "Will Vote" : "Recommends"}:{" "}
                  {vote.voteType || vote.suggestedVote}
                </Badge>
                {vote.txHash && (
                  <a
                    href={`https://explorer.testnet.mantle.xyz/tx/${vote.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Transaction
                  </a>
                )}
              </div>
            )}
            <h2 className="text-2xl font-bold">{proposal.title}</h2>
            <p className="text-muted-foreground mt-2">{proposal.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 glassmorphic">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Time Remaining</h3>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatDistanceToNow(convertToDate(proposal.deadline), {
                  addSuffix: true,
                })}
              </p>
            </Card>

            <Card className="p-4 glassmorphic">
              <div className="flex items-center space-x-2">
                <ChartBar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Current Votes</h3>
              </div>
              <div className="mt-2">
                <Progress value={forPercentage} className="h-2 mb-2" />
                <div className="flex justify-between text-sm">
                  <span>For: {forPercentage.toFixed(1)}%</span>
                  <span>Against: {againstPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 glassmorphic">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Total Votes</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{totalVotes}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasVoteData && (
              <Card className="p-6 glassmorphic">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="h-6 w-6 text-primary mr-2" />
                  AI Analysis
                </h3>
                <div className="space-y-4">
                  {vote.voteReason && (
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Vote Reasoning</h4>
                        <p className="text-muted-foreground">
                          {vote.voteReason}
                        </p>
                      </div>
                    </div>
                  )}

                  {vote.voteExplanation && (
                    <div className="flex items-start space-x-3">
                      <Scale className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Detailed Explanation</h4>
                        <p className="text-muted-foreground">
                          {vote.voteExplanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {vote.aiAnalysis && (
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Impact Analysis</h4>
                        <p className="text-muted-foreground">
                          {vote.aiAnalysis}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-6 glassmorphic">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="h-6 w-6 text-primary mr-2" />
                Proposal Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">DAO</h4>
                    <p className="text-muted-foreground">{proposal.dao.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BarChart className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Status</h4>
                    <Badge
                      variant={proposal.executed ? "default" : "secondary"}
                    >
                      {proposal.executed ? "Executed" : "Active"}
                    </Badge>
                  </div>
                </div>

                {/* Recent Votes Section */}
                <div className="flex items-start space-x-3">
                  <ChartBar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Recent Votes</h4>
                    <div className="space-y-2 mt-2">
                      {votes
                        .filter((v) => v.isVoted)
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 2)
                        .map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <Badge
                              variant={
                                v.voteType === "FOR" ? "default" : "destructive"
                              }
                              className={`${
                                v.voteType === "FOR"
                                  ? "bg-primary/20"
                                  : "bg-destructive/20"
                              }`}
                            >
                              {v.voteType === "FOR" ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <XCircle className="mr-1 h-3 w-3" />
                              )}
                              {v.voteType}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(v.timestamp, {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex space-x-4">
            <Button
              size="lg"
              className="flex-1 bg-primary/20 hover:bg-primary/30"
              onClick={() => handleVote(true)}
              disabled={isPending}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {isPending ? "Voting..." : "Vote For"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 bg-destructive/20 hover:bg-destructive/30 border-destructive"
              onClick={() => handleVote(false)}
              disabled={isPending}
            >
              <XCircle className="mr-2 h-5 w-5" />
              {isPending ? "Voting..." : "Vote Against"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
