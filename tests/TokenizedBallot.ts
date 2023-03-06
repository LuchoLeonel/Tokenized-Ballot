import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { it } from "mocha";
import { MyToken, MyToken__factory, TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";

let tokenContract: MyToken;
let ballotContract: TokenizedBallot;

let deployer: SignerWithAddress, accoun1: SignerWithAddress, account2: SignerWithAddress;


const BLOCK_NUMBER: BigNumber = 777;
const PROPOSALS = ["Apple", "Orange", "Grape"];

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let i = 0; i < array.length; i++) {
        bytes32Array.push(ethers.utils.formatBytes32String(array[i]));
    }
    return bytes32Array;
}

describe("TokenizedBallot", () => {
    beforeEach(async () => {
        [deployer, accoun1, account2] = await ethers.getSigners();
        const tokenContractFactory = new MyToken__factory(deployer);
        tokenContract = await tokenContractFactory.deploy();
        await tokenContract.deployTransaction.wait();

        const ballotContractFactory = new TokenizedBallot__factory(deployer);
        ballotContract = await ballotContractFactory.deploy(convertStringArrayToBytes32(PROPOSALS), tokenContract.address, BLOCK_NUMBER);
        await ballotContract.deployTransaction.wait();
    });

    describe("when deployed",async () => {
        it("sets token contract",async () => {
            const ballotsTokenContractAddress = await ballotContract.tokenContract(); 
           expect(ballotsTokenContractAddress).to.eq(tokenContract.address); 
        })
        it("sets targetBlockNumber",async () => {
            const ballotTargetBlockNumber = await ballotContract.targetBlockNumber(); 
            expect(ballotTargetBlockNumber).to.eq(BLOCK_NUMBER);
        })
        it("sets proposals names correctly",async () => {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposal = PROPOSALS[index];
                const proposalsFromContract = await ballotContract.proposals(index);
                expect( ethers.utils.parseBytes32String(proposalsFromContract.name))
                .to.be.eq(proposal)
            }
        })
        it("sets all proposals vote count to 0",async () => {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposalsFromContract = await ballotContract.proposals(index);
                expect(proposalsFromContract.voteCount)
                .to.be.eq(0)
            }
        })
    })

    describe("voting functionality",async () => {
        it("reverts when client with no voting power attempts to vote",async () => {
            await expect(ballotContract.connect(accoun1).vote(1, 2)).to.be.reverted
        })

        it("gives correct amount of voting power",async () => {
            const VOTING_AMOUNT = 10;

            const minterRole = await tokenContract.MINTER_ROLE();
            const grantRoleTx = await tokenContract.grantRole(minterRole, ballotContract.address);
            const giveVotesTx = await ballotContract.giveVotes(account2.address, VOTING_AMOUNT);
            
            const receipt = await giveVotesTx.wait();

            const votingPowerOfAccount2 = await ballotContract.votingPower(
              account2.address
            ); 
             expect(votingPowerOfAccount2).to.be.eq(VOTING_AMOUNT);
        })

    })



    describe("Token contract",async () => {

        describe("when token contract is deployed", async () => {
            it("sets deployer with DEFAULT_ADMIN_ROLE", async () => {
                const adminRole = await tokenContract.DEFAULT_ADMIN_ROLE(); 
                const deployerHasAdminRole = await tokenContract.hasRole(adminRole, deployer.address)
                
                 expect(deployerHasAdminRole)
                .to.be.eq(true);
            })
        })

        it("sets Ballot contract as minter",async () => {
            const minterRole = await tokenContract.MINTER_ROLE;

            await expect(tokenContract.setMinterRoles(ballotContract.address))
            .to.emit(tokenContract, "RoleGranted")
            .withArgs(minterRole, ballotContract.address, deployer.address);
        })
    });

});



