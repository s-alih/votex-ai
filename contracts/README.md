# VotexAI Smart Contracts

This directory contains the smart contracts for VotexAI, including an ERC20 token and a governance contract.

## Contracts

1. `VotexToken.sol`: ERC20 token contract for VotexAI
2. `VotexAIGovernance.sol`: Governance contract for proposal creation and voting

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A wallet with some FTM tokens on Sonic testnet

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your private key:
```
PRIVATE_KEY=your_private_key_here
```

## Deployment

To deploy the contracts to Sonic testnet:

```bash
npx hardhat run scripts/deploy.ts --network sonicTestnet
```

## Contract Verification

After deployment, you can verify your contracts on the Sonic blockchain explorer:

1. Get the contract addresses from the deployment output
2. Visit the Sonic blockchain explorer
3. Submit the source code for verification

## Testing

Run the test suite:

```bash
npx hardhat test
```

## Contract Interactions

### VotexToken

- The token has a initial supply of 1 million VOTEX
- Only the owner can mint new tokens
- Any holder can burn their tokens

### VotexAIGovernance

- Create proposals with `createProposal()`
- Vote on proposals with `vote()`
- Delegate voting power with `delegateVote()`
- Execute passed proposals with `executeProposal()`
- Voting period is set to 3 days

## Security

- Keep your private keys secure and never commit them to version control
- The governance contract uses OpenZeppelin's standard implementations
- All functions have appropriate access controls 