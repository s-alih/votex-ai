import { proposalsRef } from "../config";

export interface Proposal {
  id: string;
  daoId: string;
  daoName: string;
  description: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// get proposal by id
export async function getProposal(id: string): Promise<Proposal> {
  const doc = await proposalsRef.doc(id).get();
  return doc.data() as Proposal;
}

export async function updateProposal(proposal: Proposal): Promise<void> {
  await proposalsRef.doc(proposal.id).update({
    ...proposal,
    updatedAt: new Date(),
  });
}

// updta
