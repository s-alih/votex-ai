"use client";

import { useState } from "react";
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
import DashboardView from "@/components/dashboard/DashboardView";
import AIConfigView from "@/components/dashboard/AIConfigView";
import WalletView from "@/components/dashboard/WalletView";
import ProposalView from "@/components/dashboard/ProposalView";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [agentCreated, setAgentCreated] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  if (!walletConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="sonic-container">
          <div className="sonic-card max-w-lg w-full mx-4">
            <div className="text-center space-y-6">
              <Brain className="w-20 h-20 mx-auto text-primary animate-pulse" />
              <h1 className="sonic-heading">VotexAI</h1>
              <div className="space-y-2">
                <h2 className="sonic-heading text-2xl">Connect Your Wallet</h2>
                <p className="sonic-subheading">
                  Connect your wallet to start participating in DAO governance
                </p>
              </div>
              <Button
                className="sonic-button w-full"
                onClick={() => setWalletConnected(true)}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agentCreated) {
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
                  make sure you are funding with $SONIC for paying gas fee while
                  voting
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  className="sonic-button w-full"
                  onClick={() => setAgentCreated(true)}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create AI Agent
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
            onBack={() => setSelectedProposal(null)}
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
            <Button className="sonic-button">
              <Wallet className="mr-2 h-4 w-4" />
              0x1234...5678
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
            <DashboardView onSelectProposal={setSelectedProposal} />
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
