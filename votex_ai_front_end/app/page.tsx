"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Wallet,
  Settings,
  Activity,
  Plus,
  UserPlus,
} from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import DashboardView from "@/components/dashboard/DashboardView";
import AIConfigView from "@/components/dashboard/AIConfigView";
import WalletView from "@/components/dashboard/WalletView";
import ProposalView, {
  type Proposal,
  type Vote,
} from "@/components/dashboard/ProposalView";

interface User {
  walletAddress: string;
  agentWallet: string;
  agentWalletPrivateKey: string;
  daoMemberships: any[];
  createdAt: any;
  updatedAt: any;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [user, setUser] = useState<User | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [selectedVote, setSelectedVote] = useState<Vote | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      if (address) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/wallet/${address}`
          );
          console.log("response", response);
          if (response.ok) {
            const existingUser = await response.json();
            setUser(existingUser);
          }
        } catch (error) {
          console.error("Error checking user:", error);
        }
      }
    };

    checkUser();
  }, [address]);

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleCreateUserAndAgent = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // First create user if doesn't exist
      const createUserResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress: address }),
        }
      );

      if (createUserResponse.ok) {
        const newUser = await createUserResponse.json();
        setUser(newUser);

        // Then create agent wallet
      }
    } catch (error) {
      console.error("Error creating user and agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProposal = (proposal: Proposal, vote: Vote) => {
    setSelectedProposal(proposal);
    setSelectedVote(vote);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sonic-container">
          <div className="sonic-card max-w-lg w-full mx-4">
            <div className="text-center space-y-6">
              <img
                src="/logo.png"
                alt="VotexAI Logo"
                className="w-60  h-50 mx-auto"
              />
              <h1 className="sonic-heading">VotexAI</h1>
              <div className="space-y-2">
                <p className="sonic-subheading">
                  Connect your wallet to start participating in DAO governance
                </p>
              </div>
              <Button className="sonic-button w-full" onClick={handleConnect}>
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sonic-container">
          <div className="sonic-card max-w-lg w-full mx-4">
            <div className="text-center space-y-6">
              <UserPlus className="w-20 h-20 mx-auto text-secondary animate-pulse" />
              <div className="space-y-2">
                <h2 className="sonic-heading text-2xl">Create Agent Wallet</h2>
                <p className="sonic-subheading">
                  Create an agent wallet to help manage your DAO governance and
                  make sure you are funding with $S for paying gas fee while
                  voting
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  className="sonic-button w-full"
                  onClick={handleCreateUserAndAgent}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {isLoading ? "Creating..." : "Create AI Agent Wallet"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProposal) {
    return (
      <div className="min-h-screen">
        <div className="sonic-container py-8">
          <ProposalView
            proposal={selectedProposal}
            vote={selectedVote}
            votes={votes}
            onBack={() => {
              setSelectedProposal(null);
              setSelectedVote(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sonic-container py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-primary neon-glow-primary" />
              <h1 className="sonic-heading text-2xl">VotexAI</h1>
            </div>
            <Button className="sonic-button" onClick={() => disconnect()}>
              <Wallet className="mr-2 h-4 w-4" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            </Button>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="sonic-card grid grid-cols-3 gap-4 p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:neon-glow-primary data-[state=active]:bg-primary/20"
            >
              <Activity className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="ai-config"
              className="data-[state=active]:neon-glow-secondary data-[state=active]:bg-secondary/20"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:neon-glow-accent data-[state=active]:bg-accent/20"
            >
              <Settings className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardView onSelectProposal={handleSelectProposal} />
          </TabsContent>

          <TabsContent value="ai-config">
            <AIConfigView />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
