export interface DAO {
  id: string;
  name: string;
  tokenAddress: string;
  tokenSymbol: string;
  governanceContractAddress: string;
  description?: string; // Optional
  createdAt: Date;
  updatedAt: Date;
}
