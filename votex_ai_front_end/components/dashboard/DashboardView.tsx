"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Bot,
  Power,
  Timer,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";

interface Vote {
  id: string;
  proposalId: string;
  dao: {
    id: string;
    name: string;
    imageUrl: string;
    tokenSymbol: string;
  };

  voteType?: "FOR" | "AGAINST";
  isVoted: boolean;
  suggestedVote?: "FOR" | "AGAINST";
  voteReason?: string;
  timestamp: number;
  txHash?: string;
}

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface Proposal {
  id: string;
  daoId: string;
  dao: {
    name: string;
    imageUrl: string;
  };
  title: string;
  description: string;
  deadline: FirestoreTimestamp | string | Date;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
}

interface DashboardViewProps {
  onSelectProposal: (proposal: any) => void;
}

export default function DashboardView({
  onSelectProposal,
}: DashboardViewProps) {
  const { address } = useAccount();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      setIsLoading(true);
      try {
        // Fetch user data first to get the user ID
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/wallet/${address}`
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user");
        const { user } = await userResponse.json();

        // Fetch votes using user ID
        const votesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/votes/user/${user.walletAddress}`
        );
        if (!votesResponse.ok) throw new Error("Failed to fetch votes");
        const votesData = await votesResponse.json();
        setVotes(votesData.votes);

        // Fetch active proposals
        const proposalsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/active`
        );
        if (!proposalsResponse.ok) throw new Error("Failed to fetch proposals");
        const proposalsData = await proposalsResponse.json();
        console.log("Fetched proposals:", proposalsData);
        console.log(
          "Sample proposal deadline format:",
          proposalsData.proposals?.[0]?.deadline
        );
        setProposals(proposalsData.proposals);

        // Log the votes data
        console.log("Fetched votes:", votesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  // Add logging for state updates
  useEffect(() => {
    console.log("Current proposals state:", proposals);
    console.log("Current votes state:", votes);
  }, [proposals, votes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group proposals by DAO
  const proposalsByDao = proposals.reduce((acc, proposal) => {
    if (!acc[proposal.daoId]) {
      acc[proposal.daoId] = {
        id: proposal.daoId,
        name: proposal.dao.name,
        logo: proposal.dao.imageUrl,
        proposals: [],
      };
    }
    acc[proposal.daoId].proposals.push(proposal);
    console.log("Proposals by DAO:", acc);
    return acc;
  }, {} as Record<string, any>);

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {Object.values(proposalsByDao).map((dao: any) => (
          <Card key={dao.id} className="p-6 backdrop-blur-xl bg-background/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={dao.logo}
                  alt={dao.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold">{dao.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dao.proposals.length} Active Proposals
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {dao.proposals.map((proposal: Proposal) => {
                console.log("Proposal:", proposal.id);
                const vote = votes.find((v) => v.proposalId === proposal.id);
                console.log("Vote:", vote);
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const forPercentage =
                  totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                const againstPercentage =
                  totalVotes > 0
                    ? (proposal.votesAgainst / totalVotes) * 100
                    : 0;

                return (
                  <div
                    key={proposal.id}
                    className="space-y-4 p-6 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{proposal.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-background/30">
                            <Timer className="mr-1 h-3 w-3" />
                            {formatDistanceToNow(
                              convertToDate(proposal.deadline),
                              {
                                addSuffix: true,
                              }
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {vote && (
                      <div className="p-4 rounded-lg bg-background/30 border border-primary/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-5 w-5 text-primary" />
                            <span className="font-semibold">
                              AI Vote {vote.isVoted ? "Cast" : "Prediction"}
                            </span>
                          </div>
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
                            } text-lg`}
                          >
                            {vote.isVoted
                              ? `Voted ${vote.voteType}`
                              : `Will Vote ${vote.suggestedVote}`}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vote.voteReason}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Progress value={forPercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>For: {forPercentage.toFixed(1)}%</span>
                        <span>Against: {againstPercentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-background/30"
                        onClick={() => onSelectProposal(proposal)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View AI Analysis
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-primary/20"
                        disabled={vote?.isVoted}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-destructive/20"
                        disabled={vote?.isVoted}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 backdrop-blur-xl bg-background/30">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DAO</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votes
              .filter((vote) => vote.isVoted)
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell>{vote.dao.name}</TableCell>
                  <TableCell>Voted on Proposal #{vote.proposalId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vote.voteType === "FOR" ? "default" : "destructive"
                      }
                      className={`${
                        vote.voteType === "FOR"
                          ? "bg-primary/20"
                          : "bg-destructive/20"
                      }`}
                    >
                      {vote.voteType === "FOR" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {vote.voteType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(vote.timestamp, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
