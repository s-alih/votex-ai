// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VotexAIGovernance is Ownable {
    struct Proposal {
        uint256 id;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 createdAt;
        bool executed;
        address proposer;
        mapping(address => bool) hasVoted;
    }

    IERC20 public governanceToken;
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days; // Voting duration
    mapping(uint256 => Proposal) public proposals;
    mapping(address => address) public voteDelegation; // Delegate voting power

    event ProposalCreated(uint256 id, string description, address proposer);
    event VoteCast(
        uint256 proposalId,
        address voter,
        bool vote,
        uint256 weight
    );
    event ProposalExecuted(uint256 id, bool passed);
    event VoteDelegated(address indexed voter, address indexed delegate);
    event DelegationRevoked(address indexed voter);

    constructor(address _governanceToken) Ownable(msg.sender) {
        require(_governanceToken != address(0), "Invalid token address");
        governanceToken = IERC20(_governanceToken);
    }

    function createProposal(string memory _description) external {
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.description = _description;
        proposal.yesVotes = 0;
        proposal.noVotes = 0;
        proposal.createdAt = block.timestamp;
        proposal.executed = false;
        proposal.proposer = msg.sender;

        emit ProposalCreated(proposalCount, _description, msg.sender);
    }

    function vote(uint256 _proposalId, bool _vote) external {
        Proposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp <= proposal.createdAt + votingPeriod,
            "Voting period ended"
        );
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 voterBalance = governanceToken.balanceOf(msg.sender);
        require(voterBalance > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        if (_vote) {
            proposal.yesVotes += voterBalance;
        } else {
            proposal.noVotes += voterBalance;
        }

        emit VoteCast(_proposalId, msg.sender, _vote, voterBalance);
    }

    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp > proposal.createdAt + votingPeriod,
            "Voting period active"
        );
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;
        bool passed = proposal.yesVotes > proposal.noVotes;

        emit ProposalExecuted(_proposalId, passed);
    }

    function delegateVote(address _delegate) external {
        require(_delegate != address(0), "Invalid delegate address");
        require(_delegate != msg.sender, "Cannot delegate to yourself");

        voteDelegation[msg.sender] = _delegate;

        emit VoteDelegated(msg.sender, _delegate);
    }

    function revokeDelegation() external {
        require(voteDelegation[msg.sender] != address(0), "No delegation set");

        delete voteDelegation[msg.sender];

        emit DelegationRevoked(msg.sender);
    }
}
