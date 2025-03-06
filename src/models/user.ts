import { DAO } from "./dao";

export interface DAOMembership {
  daoId: string;
  daoName: string;
  joinedAt: Date;
  votingPower: string;
}

export interface User {
  walletAddress: string;
  agentWallet: string;
  agentWalletPrivateKey: string;
  daoMemberships: DAO[];
  createdAt: Date;
  updatedAt: Date;
}
