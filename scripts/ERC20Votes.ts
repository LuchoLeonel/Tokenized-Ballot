import { ethers } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";

const MINT_VALUE = ethers.utils.parseEther("10");

async function main() {
    const [deployer, account1, account2] = await ethers.getSigners();
    // Deploy the contract
    const contractFactory = new MyToken__factory(deployer);
    const contract: MyToken = await contractFactory.deploy();
    const deployTransactionRecipt = await contract.deployTransaction.wait();
    console.log(
        `The tokenized votes contract was deployed at the block ${deployTransactionRecipt.blockNumber}`
    );

    // Mint some tokens
    const mintTx = await contract.mint(account1.address, MINT_VALUE);
    const mintTxRecipt = await mintTx.wait();
    console.log(
        `Tokens minted  for ${account1.address} at block ${mintTxRecipt.blockNumber}`
    );
    const tokenBalanceAccount1 = await contract.balanceOf(account1.address);
    console.log(
        `Account 1 has a blanace of ${ethers.utils.formatEther(
            tokenBalanceAccount1
        )} vote tokens.`
    );

    // Check the voting power
    let votePowerAccount1 = await contract.getVotes(account1.address);
    console.log(
        `Account 1 has a vote power of ${ethers.utils.formatEther(
            votePowerAccount1
        )} units.`
    );

    // Self-delegate
    const delegateTx = await contract
        .connect(account1)
        .delegate(account1.address);
    const delegateTxRecipt = await delegateTx.wait();
    console.log(
        `Tokens delegated from ${account1.address} to ${account1.address} at block ${delegateTxRecipt.blockNumber}`
    );

    // Check the voting power again
    votePowerAccount1 = await contract.getVotes(account1.address);
    console.log(
        `Account 1 has a vote power of ${ethers.utils.formatEther(
            votePowerAccount1
        )} units.`
    );

    // Delegate
    const transferTx = await contract
        .connect(account1)
        .transfer(account2.address, MINT_VALUE.div(2));
    const transferTxRecipt = await transferTx.wait();
    console.log(
        `Tokens transferred from ${account1.address} to ${account2.address} at block ${transferTxRecipt.blockNumber}`
    );
    
    // Check the voting power again
    votePowerAccount1 = await contract.getVotes(account1.address);
    console.log(
        `Account 1 has a vote power of ${ethers.utils.formatEther(
            votePowerAccount1
        )} units.`
    );

    // Mint some more tokens
    const mintTx2 = await contract.mint(account2.address, MINT_VALUE);
    const mintTx2Recipt = await mintTx2.wait();
    console.log(
        `Tokens minted for ${account2.address} at block ${mintTx2Recipt.blockNumber}`
    );
    const tokenBalanceAccount2 = await contract.balanceOf(account2.address);
    console.log(
        `Account 2 has a balance of ${ethers.utils.formatEther(
            tokenBalanceAccount2
        )} vote tokens.`
    );

    // What block am I at
    const currentBlock = await ethers.provider.getBlock("latest");
    console.log(`The current block number is ${currentBlock.number}`);

    // Check the historic voting power
    votePowerAccount1 = await contract.getPastVotes(
        account1.address,
        currentBlock.number - 2
    );
    console.log(
        `Account 1 had a vote power of ${ethers.utils.formatEther(
            votePowerAccount1
        )} units at block ${currentBlock.number - 2}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})