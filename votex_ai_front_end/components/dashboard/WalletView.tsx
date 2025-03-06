'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from 'lucide-react';

export default function WalletView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 backdrop-blur-xl bg-background/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold">Your Wallet</h2>
                <p className="text-muted-foreground">
                  Manage your tokens
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
                <h3 className="text-sm text-muted-foreground mb-2">SONIC Balance</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">1,234.56</span>
                  <span className="text-sm font-semibold text-primary">SONIC</span>
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/20">
                    <div>
                      <p className="font-medium">Uniswap (UNI)</p>
                      <p className="text-sm text-muted-foreground">Voting Power: High</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">234.5K</p>
                      <p className="text-sm text-primary">UNI</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/20">
                    <div>
                      <p className="font-medium">Aave (AAVE)</p>
                      <p className="text-sm text-muted-foreground">Voting Power: Medium</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">1.2K</p>
                      <p className="text-sm text-primary">AAVE</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/20">
                    <div>
                      <p className="font-medium">Compound (COMP)</p>
                      <p className="text-sm text-muted-foreground">Voting Power: Medium</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">5.8K</p>
                      <p className="text-sm text-primary">COMP</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Deposit to AI Agent</h3>
              <div className="flex space-x-2">
                <Input 
                  type="number" 
                  placeholder="Amount of SONIC"
                  className="bg-background/30"
                />
                <Button className="bg-primary hover:bg-primary/90">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-background/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-secondary" />
              <div>
                <h2 className="text-2xl font-bold">AI Agent Wallet</h2>
                <p className="text-muted-foreground">
                  Manage agent's SONIC balance
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/20">
              <Brain className="mr-2 h-4 w-4" />
              Active
            </Badge>
          </div>

          <div className="space-y-6">
            <Card className="p-4 backdrop-blur-xl bg-background/30">
              <h3 className="text-sm text-muted-foreground mb-2">Agent Balance</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">456.78</span>
                <span className="text-sm font-semibold text-primary">SONIC</span>
              </div>
            </Card>

            <div className="space-y-2">
              <h3 className="font-semibold">Recent Transactions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/20">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Deposit</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">+100 SONIC</p>
                    <p className="text-sm text-muted-foreground">2h ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/20">
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Deposit</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">+50 SONIC</p>
                    <p className="text-sm text-muted-foreground">1d ago</p>
                  </div>
                </div>
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
            <TableRow>
              <TableCell>2024-03-20</TableCell>
              <TableCell>Deposit to Agent</TableCell>
              <TableCell>100 SONIC</TableCell>
              <TableCell>
                <Badge variant="default" className="bg-primary/20">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Success
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2024-03-19</TableCell>
              <TableCell>Deposit to Agent</TableCell>
              <TableCell>50 SONIC</TableCell>
              <TableCell>
                <Badge variant="default" className="bg-primary/20">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Success
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}