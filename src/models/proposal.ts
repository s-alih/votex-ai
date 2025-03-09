import { DAO } from "./dao";

export interface Proposal {
  id: string;
  daoId: string;
  dao: DAO;
  daoName: string;
  proposer: string;
  title: string;
  description: string;
  deadline: Date;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
