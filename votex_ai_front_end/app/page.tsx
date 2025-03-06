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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 glassmorphic card-hover max-w-lg w-full mx-4">
          <div className="text-center space-y-6">
            <Brain className="w-20 h-20 mx-auto text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              VotexAI
            </h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Connect Your Wallet
              </h2>
              <p className="text-muted-foreground">
                Connect your wallet to start participating in DAO governance
              </p>
            </div>
            <Button
              size="lg"
              className="w-full glassmorphic hover:neon-glow-primary transition-all duration-300"
              onClick={() => setWalletConnected(true)}
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!agentCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 glassmorphic card-hover max-w-lg w-full mx-4">
          <div className="text-center space-y-6">
            <UserPlus className="w-20 h-20 mx-auto text-secondary animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">
                Create Agent Wallet
              </h2>
              <p className="text-muted-foreground">
                Create an agent wallet to help manage your DAO governance and
                make sure you are funding with $SONIC for paying gas fee while
                voting
              </p>
            </div>
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full glassmorphic hover:neon-glow-secondary transition-all duration-300"
                onClick={() => setAgentCreated(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create AI Agent
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedProposal) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <ProposalView
            proposal={selectedProposal}
            onBack={() => setSelectedProposal(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-primary neon-glow-primary" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                VotexAI
              </h1>
            </div>
            <Button variant="outline" className="glassmorphic">
              <Wallet className="mr-2 h-4 w-4" />
              0x1234...5678
            </Button>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-4 glassmorphic p-1">
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
