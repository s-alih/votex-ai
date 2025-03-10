import { User } from "./user";
import { DAO } from "./dao";

export interface AIAgent {
  id?: string;
  userId: string;
  daoId: string;
  isAutoVoteEnabled: boolean;
  preferencesEmbedding: number[];
  governanceStrategy: string;
  riskProfile: number;
  voteAlignment: string;
  user: User;
  dao: DAO;
  createdAt: Date;
  updatedAt: Date;
}
