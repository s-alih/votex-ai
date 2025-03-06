'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';

export default function ProposalView({ proposal, onBack }) {
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
            <div className="flex items-center space-x-3 mb-4">
              <Badge 
                variant={proposal.aiRecommendation === 'approve' ? 'default' : 'destructive'}
                className={`${proposal.aiRecommendation === 'approve' ? 'bg-primary/20' : 'bg-destructive/20'} text-lg py-2`}
              >
                <Brain className="mr-2 h-5 w-5" />
                AI Recommends: {proposal.aiRecommendation === 'approve' ? 'Approve' : 'Reject'}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold">{proposal.title}</h2>
            <p className="text-muted-foreground mt-2">{proposal.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 glassmorphic">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Time Remaining</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{proposal.timeRemaining}</p>
            </Card>

            <Card className="p-4 glassmorphic">
              <div className="flex items-center space-x-2">
                <ChartBar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Current Votes</h3>
              </div>
              <div className="mt-2">
                <Progress value={proposal.votes.for} className="h-2 mb-2" />
                <div className="flex justify-between text-sm">
                  <span>For: {proposal.votes.for}%</span>
                  <span>Against: {proposal.votes.against}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 glassmorphic">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Confidence</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{proposal.confidence}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 glassmorphic">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="h-6 w-6 text-primary mr-2" />
                AI Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Security Impact</h4>
                    <p className="text-muted-foreground">
                      This proposal has been analyzed for potential security risks and implementation concerns.
                      Our AI detected no critical vulnerabilities in the proposed changes.
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-accent/20">Low Risk</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Economic Analysis</h4>
                    <p className="text-muted-foreground">
                      Projected positive impact on protocol revenue and token value.
                      Historical data suggests similar proposals led to 15-20% growth.
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-primary/20">High Impact</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Scale className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Governance Impact</h4>
                    <p className="text-muted-foreground">
                      Analysis of governance implications shows balanced power distribution
                      and alignment with protocol's long-term objectives.
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-secondary/20">Balanced</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 glassmorphic">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="h-6 w-6 text-primary mr-2" />
                Community Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Sentiment Analysis</h4>
                    <p className="text-muted-foreground">
                      Analysis of community discussions across forums and social media
                      indicates strong support (85% positive sentiment).
                    </p>
                    <div className="mt-2">
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BarChart className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Voting Patterns</h4>
                    <p className="text-muted-foreground">
                      Historical analysis shows similar proposals have passed with
                      70-80% approval rate. Current trajectory aligns with this pattern.
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-primary/20">High Likelihood to Pass</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Key Concerns</h4>
                    <p className="text-muted-foreground">
                      Minor concerns about implementation timeline and resource allocation
                      have been raised by the community.
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-accent/20">Minor Concerns</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex space-x-4">
            <Button 
              size="lg" 
              className="flex-1 bg-primary/20 hover:bg-primary/30 neon-glow-primary"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Vote For
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1 bg-destructive/20 hover:bg-destructive/30 border-destructive"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Vote Against
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}