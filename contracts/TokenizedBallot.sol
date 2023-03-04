// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Ballot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    Proposal[] public proposals;
    
    constructor(bytes32[] memory proposalNames) {
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }
    
    function vote(uint proposal) external {
        //TODO
    }
    
    function winningProposal() public view returns (uint winningProposal) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount; winningProposal = p;
            }
        }
    }
    
    function winnerName() external view returns (bytes32 winnerName) {
        winnerName = proposals[winningProposal()].name;
    }
}
