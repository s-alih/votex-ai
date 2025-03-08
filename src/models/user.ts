import { DAO } from "./dao";

export interface User {
  walletAddress: string;
  agentWallet: string;
  agentWalletPrivateKey: string;
  daoMemberships: DAO[];
  createdAt: Date;
  updatedAt: Date;
}
