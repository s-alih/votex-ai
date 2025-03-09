// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VotexAIGovernance is Ownable {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 createdAt;
        bool executed;
        address proposer;
        mapping(address => bool) hasVoted;
        mapping(address => bool) hasAIVoted; // Track AI votes separately
    }

    IERC20 public governanceToken;
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days; // Voting duration
    mapping(uint256 => Proposal) public proposals;
    mapping(address => address) public voteDelegation; // Delegate voting power
    mapping(address => address) public aiAgentUser;
    mapping(address => uint256) public aiAgentVotingPower;
    mapping(address => address) public userToAIAgent; // Map users to their AI agents

    event ProposalCreated(
        uint256 id,
        string title,
        string description,
        address proposer
    );
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

    function createProposal(
        string memory _title,
        string memory _description
    ) external {
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.title = _title;
        proposal.description = _description;
        proposal.yesVotes = 0;
        proposal.noVotes = 0;
        proposal.createdAt = block.timestamp;
        proposal.executed = false;
        proposal.proposer = msg.sender;

        emit ProposalCreated(proposalCount, _title, _description, msg.sender);
    }

    // Regular user voting function
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

    // AI agent voting on behalf of a user
    function voteAsAIAgent(
        uint256 _proposalId,
        bool _vote,
        address _user
    ) external {
        require(
            userToAIAgent[_user] == msg.sender,
            "Not authorized AI agent for user"
        );

        Proposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp <= proposal.createdAt + votingPeriod,
            "Voting period ended"
        );
        require(proposal.hasVoted[_user], "User must vote first");
        require(!proposal.hasAIVoted[_user], "AI already voted for this user");

        // find user address from aiAgentUser mapping
        address user = aiAgentUser[msg.sender];
        uint256 votingPower = governanceToken.balanceOf(user);
        require(votingPower > 0, "No AI voting power");

        proposal.hasAIVoted[_user] = true;
        if (_vote) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }

        emit VoteCast(_proposalId, user, _vote, votingPower);
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
        aiAgentUser[_delegate] = msg.sender;

        emit VoteDelegated(msg.sender, _delegate);
    }

    function revokeDelegation() external {
        require(voteDelegation[msg.sender] != address(0), "No delegation set");

        delete voteDelegation[msg.sender];
        delete aiAgentUser[msg.sender];
        emit DelegationRevoked(msg.sender);
    }
}
