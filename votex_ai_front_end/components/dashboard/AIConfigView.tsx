'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'lucide-react';

interface Vote {
  id: number;
  proposal: string;
  vote: 'approve' | 'reject';
  confidence: number;
  outcome: 'correct' | 'incorrect' | 'pending';
  timestamp: string;
}

interface Agent {
  id: number;
  name: string;
  dao: string;
  strategy: string;
  riskProfile: number;
  voteAlignment: string;
  votes: Vote[];
}

const mockAgents = [
  {
    id: 1,
    name: 'Aave Agent',
    dao: 'Aave',
    strategy: 'balanced',
    riskProfile: 60,
    voteAlignment: 'independent',
    votes: [
      {
        id: 1,
        proposal: 'AIP-V3: Upgrade Interest Rate Model',
        vote: 'reject',
        confidence: 87,
        outcome: 'correct',
        timestamp: '2024-03-19T10:00:00Z',
      },
      {
        id: 2,
        proposal: 'AIP-V2: Add WBTC as Collateral',
        vote: 'approve',
        confidence: 92,
        outcome: 'incorrect',
        timestamp: '2024-03-15T14:30:00Z',
      },
    ],
  },
  {
    id: 2,
    name: 'Uniswap Agent',
    dao: 'Uniswap',
    strategy: 'growth',
    riskProfile: 75,
    voteAlignment: 'independent',
    votes: [
      {
        id: 3,
        proposal: 'UNI-P-V3: Deploy on Base',
        vote: 'approve',
        confidence: 92,
        outcome: 'pending',
        timestamp: '2024-03-20T15:00:00Z',
      },
    ],
  },
];

export default function AIConfigView() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showNewAgent, setShowNewAgent] = useState(false);

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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a DAO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uniswap">Uniswap</SelectItem>
                <SelectItem value="aave">Aave</SelectItem>
                <SelectItem value="compound">Compound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Governance Strategy</Label>
            <RadioGroup defaultValue="balanced" className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Slider defaultValue={[50]} max={100} step={1} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Vote Alignment</Label>
            <RadioGroup defaultValue="independent" className="space-y-2">
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
              onClick={() => setShowNewAgent(false)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Deploy AI Agent
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowNewAgent(false)}
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
                <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
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
                <span className="text-lg font-semibold capitalize">{selectedAgent.strategy}</span>
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">Risk Profile</h3>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">{selectedAgent.riskProfile}%</span>
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">Vote Alignment</h3>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold capitalize">{selectedAgent.voteAlignment}</span>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Voting History & Training</h3>
            {selectedAgent.votes.map((vote) => (
              <Card key={vote.id} className="p-4 backdrop-blur-xl bg-background/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{vote.proposal}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant={vote.vote === 'approve' ? 'default' : 'destructive'}
                        className={vote.vote === 'approve' ? 'bg-primary/20' : 'bg-destructive/20'}
                      >
                        {vote.vote === 'approve' ? 'For' : 'Against'} ({vote.confidence}%)
                      </Badge>
                      {vote.outcome !== 'pending' && (
                        <Badge
                          variant={vote.outcome === 'correct' ? 'default' : 'destructive'}
                          className={vote.outcome === 'correct' ? 'bg-accent/20' : 'bg-destructive/20'}
                        >
                          {vote.outcome === 'correct' ? 'Correct' : 'Incorrect'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {vote.outcome === 'pending' ? (
                    <span className="text-sm text-muted-foreground">Pending</span>
                  ) : (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="bg-accent/20">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="bg-destructive/20">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
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
          className="bg-primary/20 hover:bg-primary/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          New AI Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockAgents.map((agent) => (
          <Card 
            key={agent.id} 
            className="p-6 backdrop-blur-xl bg-background/30 hover:bg-background/40 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {agent.dao} • {agent.strategy} strategy
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-primary/20">
                  <Shield className="mr-1 h-3 w-3" />
                  {agent.riskProfile}% Risk
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}