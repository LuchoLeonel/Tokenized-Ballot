import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken__factory } from "../typechain-types";
dotenv.config();

async function main() {
  const args = process.argv;
  const contractAddress = args[2];
  const receiverAddress = args[3];
  const amount = args[4];
  if (!contractAddress) throw new Error("Missing token contract address");
  if (!receiverAddress) throw new Error("Missing wallet address");
  if (!amount) throw new Error("Missing amount to transfer");

  const convertedAmount = ethers.utils.parseEther(amount);
  const provider = ethers.provider;
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} eth`);
  
  const tokenContractFactory = new MyToken__factory(signer);
  const tokenContract = tokenContractFactory.attach(contractAddress);
  const contractSymbol = await tokenContract.symbol();
  const tokenBalanceBeforeTx = await tokenContract.balanceOf(signer.address);
  console.log(`Token ${contractSymbol} balance before transfer is ${ethers.utils.formatEther(tokenBalanceBeforeTx)}`
  );

  const transferTx = await tokenContract.transfer(receiverAddress,convertedAmount);
  transferTx.wait().then(async (receiptTx) => {
    console.log({ receiptTx });
    console.log("Token transfer complete!");

    const tokenBalanceFromSigner = await tokenContract.balanceOf(signer.address);
    const votingPowerFromSigner = await tokenContract.getVotes(signer.address);
    console.log(`Address: ${signer.address} - Token balance: ${ethers.utils.formatEther(tokenBalanceFromSigner)}, Voting Power: ${ethers.utils.formatEther(votingPowerFromSigner)}`);

    const tokenBalanceWalletDestination = await tokenContract.balanceOf(receiverAddress);
    const votingPowerWalletDestination = await tokenContract.getVotes(receiverAddress);
    console.log(`Wallet address: ${receiverAddress} - Balance: ${ethers.utils.formatEther(tokenBalanceWalletDestination)}, Voting Power: ${ethers.utils.formatEther(
        votingPowerWalletDestination
      )}`
    );
  });
}

main().catch((e) => {
  console.log(e);
  process.exitCode = 1;
});