import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken__factory } from "../typechain-types";
dotenv.config();

async function main() {
  const args = process.argv;
  const tokenAddress = args[2];
  const delegatedAddress = args[3];
  if (!tokenAddress) throw new Error("Missing contract address");
  if (!delegatedAddress) throw new Error("Missing address to delegate voting power");

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0) throw new Error("Missing private key, check .env file");
  
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} ETH`
  );

  const myTokenContractFactory = new MyToken__factory(signer);
  const tokenContract = myTokenContractFactory.attach(tokenAddress);

  const contractSymbol = await tokenContract.symbol();
  const tokenBalance = await tokenContract.balanceOf(signer.address);
  console.log(`Token ${contractSymbol} balance is ${ethers.utils.formatEther(tokenBalance)}`);

  console.log("Delegated your voting power");
  const delegateTx = await tokenContract
    .connect(signer)
    .delegate(signer.address);
  const delegateTxReceipt = await delegateTx.wait();
  console.log(`Delegated tokens at block ${delegateTxReceipt.blockNumber}`);

  const votePowerDeployer = await tokenContract.getVotes(signer.address);
  console.log(`The ${delegatedAddress} have ${ethers.utils.formatEther(votePowerDeployer)} voting power units`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});