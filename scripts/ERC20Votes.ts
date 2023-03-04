import { ethers } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";

const MINT_VALUE = ethers.utils.parseEther("10");

async function main() {
    const [deployer, account1, account2] = await ethers.getSigners();
    const contractFactory = new MyToken__factory(deployer);
    const contract: MyToken = await contractFactory.deploy();
    const deployTransactionReceipt = await contract.deployTransaction.wait();
    console.log(`The Tokenized Votes Contract was deployed at block ${deployTransactionReceipt.blockNumber}`);

    const mintTx = await contract.mint(account1.address, MINT_VALUE);
    const mintTxReceipt = await mintTx.wait();
    console.log(`Token minted for ${account1.address} at block ${mintTxReceipt.blockNumber}`);
    const tokenBalanceAccount1 = await contract.balanceOf(account1.address);
    console.log(`Account 1 has a balance of ${ethers.utils.formatEther(tokenBalanceAccount1)} Vote Tokens`);

    let votePowerAccount1 = await contract.getVotes(account1.address);
    console.log(`Account 1 has a vote power of ${ethers.utils.formatEther(votePowerAccount1)} units`);

    const delegateTx = await contract.connect(account1).delegate(account1.address);
    const delegateTxReceipt = await delegateTx.wait();
    console.log(`Tokens delegated for ${account1.address} at block ${delegateTxReceipt.blockNumber}`);
    
    votePowerAccount1 = await contract.getVotes(account1.address);
    console.log(`Account 1 has a vote power of ${ethers.utils.formatEther(votePowerAccount1)} units`);

    const mintTx2 = await contract.mint(account2.address, MINT_VALUE);
    const mintTxReceipt2 = await mintTx2.wait();
    console.log(`Token minted for ${account2.address} at block ${mintTxReceipt2.blockNumber}`);
    const tokenBalanceAccount2 = await contract.balanceOf(account2.address);
    console.log(`Account 2 has a balance of ${ethers.utils.formatEther(tokenBalanceAccount2)} Vote Tokens`);
    
} 

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
