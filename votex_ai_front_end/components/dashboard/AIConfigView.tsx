"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  TrendingUp,
  Shield,
  Rocket,
  DollarSign,
  Users,
  Lock,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
} from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";

import { parseAbi } from "viem";
import { toast } from "sonner";

interface Vote {
  id: string;
  proposalId: string;
  proposal: {
    id: string;
    title: string;
    description: string;
  };
  voteType?: "FOR" | "AGAINST";
  isVoted: boolean;
  suggestedVote?: "FOR" | "AGAINST";
  voteReason?: string;
  voteExplanation?: string;
  aiAnalysis?: string;
  timestamp: number;
  txHash?: string;
}

interface Agent {
  id: string;
  userId: string;
  daoId: string;
  isAutoVoteEnabled: boolean;
  governanceStrategy: string;
  riskProfile: number;
  voteAlignment: string;
  votes?: Vote[];
  createdAt: string;
  updatedAt: string;
  dao: DAO;
}

interface DAO {
  id: string;
  name: string;
  tokenAddress: string;
  tokenSymbol: string;
  governanceContractAddress: string;
  description?: string;
}

interface User {
  walletAddress: string;
  agentWallet: string;
  agentWalletPrivateKey: string;
  daoMemberships: DAO[];
  createdAt: any;
  updatedAt: any;
}

// Add contract ABI and address
const GOVERNANCE_CONTRACT_ABI = parseAbi([
  "function delegateVote(address _delegate) external",
  "function revokeDelegation() external",
  "function voteDelegation(address) public view returns (address)",
  "function aiAgentUser(address) public view returns (address)",
  "event ProposalCreated(uint256 id, string description, address proposer)",
  "event VoteCast(uint256 proposalId, address voter, bool vote, uint256 weight)",
  "event ProposalExecuted(uint256 id, bool passed)",
  "event VoteDelegated(address indexed voter, address indexed delegate)",
  "event DelegationRevoked(address indexed voter)",
  "event AIAgentVoteCast(uint256 proposalId, address indexed agent, address indexed user, bool vote, uint256 weight)",
]);

export default function AIConfigView() {
  const { address } = useAccount();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [daos, setDaos] = useState<DAO[]>([]);
  const [availableDAOs, setAvailableDAOs] = useState<DAO[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDAO, setSelectedDAO] = useState<string>("");
  const [governanceStrategy, setGovernanceStrategy] = useState("decentralized");
  const [riskProfile, setRiskProfile] = useState(50);
  const [voteAlignment, setVoteAlignment] = useState("independent");
  const [user, setUser] = useState<User | null>(null);
  const [delegatingAgent, setDelegatingAgent] = useState<string | null>(null);
  const [agentVotes, setAgentVotes] = useState<Vote[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  const [isLoadingDAOs, setIsLoadingDAOs] = useState(true);

  // Fetch user data to get agent wallet
  useEffect(() => {
    const fetchUser = async () => {
      if (!address) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/wallet/${address}`
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [address]);

  // Remove the simulate hooks since we're not using them
  const {
    writeContract: delegateVoteToggle,
    isPending: isDelegatingToggle,
    isSuccess: isDelegationToggleSuccess,
  } = useWriteContract();

  // Handle auto-vote toggle
  const handleAutoVoteToggle = async (agent: Agent) => {
    if (!user?.agentWallet || !address) {
      toast.error("Agent wallet not found");
      return;
    }

    try {
      setDelegatingAgent(agent.id);

      // First call smart contract
      if (agent.isAutoVoteEnabled) {
        // Revoke delegation
        delegateVoteToggle({
          address: agent.dao.governanceContractAddress as `0x${string}`,
          abi: GOVERNANCE_CONTRACT_ABI,
          functionName: "revokeDelegation",
        });
        toast.info("Revoking vote delegation...");
      } else {
        // Delegate votes
        delegateVoteToggle({
          address: agent.dao.governanceContractAddress as `0x${string}`,
          abi: GOVERNANCE_CONTRACT_ABI,
          functionName: "delegateVote",
          args: [user.agentWallet as `0x${string}`],
        });
        toast.info("Delegating voting power...");
      }

      // Then call API to update delegation status
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/agents/toggle-delegation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: address,
            agentId: agent.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update delegation status");
      }

      // Refresh agents list after successful toggle
      const agentsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/agents/user/${address}`
      );
      if (agentsResponse.ok) {
        const data = await agentsResponse.json();
        setAgents(data.agents || []);
        toast.success("Auto-vote status updated successfully!");
      }
    } catch (error) {
      console.error("Error toggling auto-vote:", error);
      toast.error("Failed to toggle auto-vote");
    } finally {
      setDelegatingAgent(null);
    }
  };

  // Create agent after successful delegation
  useEffect(() => {
    const createAgentAfterDelegation = async () => {
      if (isDelegationToggleSuccess && address && selectedDAO) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/agents`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: address,
                daoId: selectedDAO,
                isAutoVoteEnabled: true,
                governanceStrategy,
                riskProfile,
                voteAlignment,
              }),
            }
          );

          if (response.ok) {
            // Refresh agents list
            const agentsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/agents/user/${address}`
            );
            if (agentsResponse.ok) {
              const data = await agentsResponse.json();
              setAgents(data.agents || []);
            }
            setShowNewAgent(false);
            toast.success("AI Agent created successfully!");
          }
        } catch (error) {
          console.error("Error creating agent:", error);
          toast.error("Failed to create AI Agent");
        }
      }
    };

    createAgentAfterDelegation();
  }, [
    isDelegationToggleSuccess,
    address,
    selectedDAO,
    governanceStrategy,
    riskProfile,
    voteAlignment,
  ]);

  const handleCreateAgent = async () => {
    if (!address || !selectedDAO || !user?.agentWallet) {
      toast.error("Missing required information");
      return;
    }

    try {
      // First delegate voting power to AI agent
      delegateVoteToggle({
        address: daos.find((dao) => dao.id === selectedDAO)
          ?.governanceContractAddress as `0x${string}`,
        abi: GOVERNANCE_CONTRACT_ABI,
        functionName: "delegateVote",
        args: [user.agentWallet as `0x${string}`],
      });
      toast.info("Delegating voting power to AI Agent...");
    } catch (error) {
      console.error("Error delegating votes:", error);
      toast.error("Failed to delegate voting power");
    }
  };

  useEffect(() => {
    const fetchDAOs = async () => {
      try {
        setIsLoadingDAOs(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/daos/all`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched DAOs:", data);
          setDaos(data.daos || []);
          setAvailableDAOs(data.daos || []);
        }
      } catch (error) {
        console.error("Error fetching DAOs:", error);
      } finally {
        setIsLoadingDAOs(false);
      }
    };

    fetchDAOs();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/agents/user/${address}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched agents data:", data); // Debug log
          if (Array.isArray(data.agents)) {
            setAgents(data.agents);
            // remove the DAOs that the user already has an agent for
            setAvailableDAOs(
              availableDAOs.filter(
                (dao: DAO) =>
                  !data.agents.some((agent: Agent) => agent.daoId === dao.id)
              )
            );
          } else {
            console.error("Invalid agents data format:", data);
            setAgents([]);
          }
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        setAgents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [address]);

  // Update agent after successful delegation toggle
  useEffect(() => {
    const updateAgentAfterDelegation = async () => {
      if (isDelegationToggleSuccess && delegatingAgent && address) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/agents/${delegatingAgent}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                isAutoVoteEnabled: !agents.find((a) => a.id === delegatingAgent)
                  ?.isAutoVoteEnabled,
              }),
            }
          );

          if (response.ok) {
            // Refresh agents list
            const agentsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/agents/user/${address}`
            );
            if (agentsResponse.ok) {
              const data = await agentsResponse.json();
              setAgents(data.agents || []);
            }
            toast.success("Auto-vote status updated successfully!");
          }
        } catch (error) {
          console.error("Error updating agent:", error);
          toast.error("Failed to update auto-vote status");
        } finally {
          setDelegatingAgent(null);
        }
      }
    };

    updateAgentAfterDelegation();
  }, [isDelegationToggleSuccess, delegatingAgent, address]);

  // Add effect to fetch votes when agent is selected
  useEffect(() => {
    const fetchAgentVotes = async () => {
      if (!selectedAgent || !address) return;

      try {
        setIsLoadingVotes(true);
        const agentId = `${selectedAgent.daoId}-${address}`;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/votes/agent/${agentId}`
        );

        if (response.ok) {
          const data = await response.json();
          setAgentVotes(data.votes || []);
        } else {
          console.error("Failed to fetch agent votes:", response.status);
          setAgentVotes([]);
        }
      } catch (error) {
        console.error("Error fetching agent votes:", error);
        setAgentVotes([]);
      } finally {
        setIsLoadingVotes(false);
      }
    };

    fetchAgentVotes();
  }, [selectedAgent, address]);

  if (showNewAgent) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-background/30">
        <div className="flex items-center space-x-4 mb-6">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">New AI Agent Configuration</h2>
            <p className="text-muted-foreground">
              Customize how your AI agent votes on proposals
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label>Select DAO to Configure</Label>
            <Select value={selectedDAO} onValueChange={setSelectedDAO}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingDAOs ? "Loading DAOs..." : "Choose a DAO"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDAOs ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  availableDAOs.map((dao: DAO) => (
                    <SelectItem key={dao.id} value={dao.id}>
                      {dao.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Governance Strategy</Label>
            <RadioGroup
              value={governanceStrategy}
              onValueChange={setGovernanceStrategy}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Label
                htmlFor="decentralized"
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-primary/5"
              >
                <RadioGroupItem value="decentralized" id="decentralized" />
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Decentralization-Focused</p>
                  <p className="text-sm text-muted-foreground">
                    Prioritize community-driven decisions
                  </p>
                </div>
              </Label>
              <Label
                htmlFor="profit"
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-primary/5"
              >
                <RadioGroupItem value="profit" id="profit" />
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Profit-Driven</p>
                  <p className="text-sm text-muted-foreground">
                    Focus on financial outcomes
                  </p>
                </div>
              </Label>
              <Label
                htmlFor="growth"
                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-primary/5"
              >
                <RadioGroupItem value="growth" id="growth" />
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Progressive Growth</p>
                  <p className="text-sm text-muted-foreground">
                    Balance innovation and stability
                  </p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Risk Profile</Label>
            <div className="space-y-2">
              <Slider
                value={[riskProfile]}
                onValueChange={(value) => setRiskProfile(value[0])}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Vote Alignment</Label>
            <RadioGroup
              value={voteAlignment}
              onValueChange={setVoteAlignment}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="influencers" id="influencers" />
                <Label htmlFor="influencers" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Align with top governance influencers
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="majority" id="majority" />
                <Label htmlFor="majority" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Align with community majority
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="independent" id="independent" />
                <Label htmlFor="independent" className="flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Fully independent AI voting
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex space-x-4">
            <Button
              className="flex-1 bg-primary/20 hover:bg-primary/30"
              onClick={handleCreateAgent}
              disabled={
                !selectedDAO || isDelegatingToggle || !user?.agentWallet
              }
            >
              {isDelegatingToggle ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Delegating Vote Power...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Deploy AI Agent
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowNewAgent(false)}
              disabled={isDelegatingToggle}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (selectedAgent) {
    return (
      <div className="space-y-6">
        <Card className="p-6 backdrop-blur-xl bg-background/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedAgent.dao.name} Agent
                </h2>
                <p className="text-muted-foreground">
                  Current Configuration and Performance
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                Back
              </Button>
              <Button className="bg-primary/20 hover:bg-primary/30">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Configuration
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">Strategy</h3>
              <div className="flex items-center space-x-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold capitalize">
                  {selectedAgent.governanceStrategy}
                </span>
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">
                Risk Profile
              </h3>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {selectedAgent.riskProfile}%
                </span>
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">
                Vote Alignment
              </h3>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold capitalize">
                  {selectedAgent.voteAlignment}
                </span>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Voting History & Training</h3>
            {isLoadingVotes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : agentVotes.length === 0 ? (
              <Card className="p-4 backdrop-blur-xl bg-background/30">
                <p className="text-center text-muted-foreground">
                  No votes found for this agent
                </p>
              </Card>
            ) : (
              agentVotes.map((vote) => (
                <Card
                  key={vote.id}
                  className="p-4 backdrop-blur-xl bg-background/30"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-lg">
                          {vote.proposal.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {vote.proposal.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          {vote.isVoted ? (
                            <Badge
                              variant={
                                vote.voteType === "FOR"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                vote.voteType === "FOR"
                                  ? "bg-primary/20"
                                  : "bg-destructive/20"
                              }
                            >
                              Voted {vote.voteType}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-500/20"
                            >
                              Pending Vote
                            </Badge>
                          )}
                          {vote.txHash && (
                            <a
                              href={`https://explorer.testnet.mantle.xyz/tx/${vote.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View Transaction
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(vote.timestamp).toLocaleDateString()}{" "}
                          {new Date(vote.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-background/40 rounded-lg p-3">
                      {vote.suggestedVote && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            AI Suggestion:
                          </span>
                          <Badge variant="outline" className="bg-primary/10">
                            {vote.suggestedVote}
                          </Badge>
                        </div>
                      )}
                      {vote.voteReason && (
                        <div>
                          <span className="text-sm font-medium">Reason:</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vote.voteReason}
                          </p>
                        </div>
                      )}
                      {vote.aiAnalysis && (
                        <div>
                          <span className="text-sm font-medium">Analysis:</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vote.aiAnalysis}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-accent/20"
                        onClick={() => {
                          // TODO: Implement feedback
                          toast.success("Thank you for your feedback!");
                        }}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-destructive/20"
                        onClick={() => {
                          // TODO: Implement feedback
                          toast.success("Thank you for your feedback!");
                        }}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">AI Agents</h2>
        <Button
          onClick={() => setShowNewAgent(true)}
          className={`${
            agents.length === 0
              ? "bg-primary hover:bg-primary/90 animate-pulse"
              : "bg-primary/20 hover:bg-primary/30"
          }`}
        >
          <Plus className="mr-2 h-4 w-4" />
          {agents.length === 0 ? "Create Your First AI Agent" : "New AI Agent"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : agents.length === 0 ? (
        <Card className="p-8 backdrop-blur-xl bg-background/30 text-center">
          <Brain className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">No AI Agents Found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI agent to start automating your DAO governance
            decisions.
          </p>
          <Button
            onClick={() => setShowNewAgent(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create AI Agent
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {agents.map((agent: Agent) => (
            <Card
              key={agent.id}
              className="p-6 backdrop-blur-xl bg-background/30 hover:bg-background/40 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center space-x-4"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <Brain className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {agent.dao.name} Agent
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {agent.governanceStrategy} • {agent.riskProfile}% Risk
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-medium mb-2 ${
                        agent.isAutoVoteEnabled
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {agent.isAutoVoteEnabled
                        ? "Vote Power Delegated"
                        : "Vote Power Not Delegated"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${
                        agent.isAutoVoteEnabled
                          ? "bg-primary/20"
                          : "bg-destructive/20"
                      } hover:bg-primary/30`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoVoteToggle(agent);
                      }}
                      disabled={
                        isDelegatingToggle ||
                        delegatingAgent === agent.id ||
                        !user?.agentWallet
                      }
                    >
                      {delegatingAgent === agent.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                          {agent.isAutoVoteEnabled
                            ? "Revoking..."
                            : "Delegating..."}
                        </>
                      ) : (
                        <>
                          {agent.isAutoVoteEnabled ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Disable Auto-Vote
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Enable Auto-Vote
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAgent(agent);
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
