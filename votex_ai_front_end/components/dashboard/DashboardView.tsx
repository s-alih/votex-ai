'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

const mockDAOs = [
  {
    id: 1,
    name: 'Uniswap',
    logo: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=128&h=128&fit=crop',
    aiAgent: {
      deployed: true,
      autoVoting: true,
      lastActive: '2h ago',
    },
    proposals: [
      {
        id: 1,
        title: 'UNI-P-V3: Deploy Uniswap v3 on Base',
        description: 'Proposal to deploy Uniswap v3 on Base network to expand protocol reach',
        aiRecommendation: 'approve',
        confidence: 92,
        timeRemaining: '2d 4h',
        votes: { for: 65, against: 35 },
        votingEnds: '2024-03-25T15:00:00Z',
      },
    ],
    votingPower: '234.5K UNI',
  },
  {
    id: 2,
    name: 'Aave',
    logo: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=128&h=128&fit=crop',
    aiAgent: {
      deployed: true,
      autoVoting: false,
      lastActive: '1d ago',
    },
    proposals: [
      {
        id: 2,
        title: 'AIP-V3: Upgrade Interest Rate Model',
        description: 'Proposal to update the interest rate model for improved capital efficiency',
        aiRecommendation: 'reject',
        confidence: 87,
        timeRemaining: '1d 12h',
        votes: { for: 45, against: 55 },
        votingEnds: '2024-03-24T10:00:00Z',
      },
    ],
    votingPower: '1.2K AAVE',
  },
];

interface DashboardViewProps {
  onSelectProposal: (proposal: any) => void;
}

export default function DashboardView({ onSelectProposal }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {mockDAOs.map((dao) => (
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
                    Voting Power: {dao.votingPower}
                  </p>
                </div>
              </div>
              {dao.aiAgent.deployed && (
                <Badge
                  variant="default"
                  className="bg-primary/20"
                >
                  <Brain className="mr-1 h-3 w-3" />
                  AI Active
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {dao.proposals.map((proposal) => (
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
                          Voting ends in {proposal.timeRemaining}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/30 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <span className="font-semibold">AI Vote Prediction</span>
                      </div>
                      <Badge
                        variant={proposal.aiRecommendation === 'approve' ? 'default' : 'destructive'}
                        className={`${proposal.aiRecommendation === 'approve' ? 'bg-primary/20' : 'bg-destructive/20'} text-lg`}
                      >
                        {proposal.aiRecommendation === 'approve' ? 'Will Vote For' : 'Will Vote Against'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence: {proposal.confidence}%</span>
                      <span className="text-muted-foreground">Auto-voting {dao.aiAgent.autoVoting ? 'enabled' : 'disabled'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={proposal.votes.for} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>For: {proposal.votes.for}%</span>
                      <span>Against: {proposal.votes.against}%</span>
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
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-destructive/20"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
            <TableRow>
              <TableCell>Uniswap</TableCell>
              <TableCell>Voted on UNI-P-V3</TableCell>
              <TableCell>
                <Badge variant="default" className="bg-primary/20">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approved
                </Badge>
              </TableCell>
              <TableCell>2h ago</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Aave</TableCell>
              <TableCell>AI Vote on AIP-V3</TableCell>
              <TableCell>
                <Badge variant="destructive" className="bg-destructive/20">
                  <XCircle className="mr-1 h-3 w-3" />
                  Rejected
                </Badge>
              </TableCell>
              <TableCell>5h ago</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}