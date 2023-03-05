//SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


import "@openzeppelin/contracts/access/Ownable.sol";

interface IMyToken {
    function getPastVotes(
        address account,
        uint256 blockNumber
    ) external view returns (uint256);
    function mint(address to, uint256 amount) external;
}

contract TokenizedBallot is Ownable {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    mapping(address => uint256) public votingPowerSpent;
    uint256 public targetBlockNumber;
    IMyToken public tokenContract;
    Proposal[] public proposals;

    constructor(
        bytes32[] memory proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function giveVotes(address to, uint256 amount) external onlyOwner {
        tokenContract.mint(msg.sender, amount);
    }

    function vote(uint proposal, uint256 amount) external {
        require(votingPower(msg.sender) >= amount);
        votingPowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function votingPower(address account) public view returns (uint256) {
        return
            tokenContract.getPastVotes(account, targetBlockNumber) - 
            votingPowerSpent[account];
    }

    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint p = 0; p < proposals.length;) {
            uint256 proposalVoteCount = proposals[p].voteCount;
            if (proposalVoteCount > winningVoteCount) {
                winningVoteCount = proposalVoteCount;
                winningProposal_ = p;
            }
            unchecked{ p++; }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
