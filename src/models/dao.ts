export interface DAO {
  id: string;
  name: string;
  tokenAddress: string;
  tokenSymbol: string;
  governanceContractAddress: string;
  description?: string; // Optional
  tokenBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}
