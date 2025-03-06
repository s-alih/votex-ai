export interface Proposal {
  id: string;
  daoId: string;
  daoName: string;
  title: string;
  description: string;
  deadline: number;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
}
