import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
import { exec } from 'child_process';
dotenv.config();

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const args = process.argv;
  const contractAddress = args[2];
  const proposals = args.slice(3);
  
  if (!contractAddress) throw new Error("Missing contract address");
  if (!proposals.length) throw new Error("Missing proposals");
  
  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} eth`);

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  console.log({proposals: proposals.map(proposal => ethers.utils.formatBytes32String(proposal))});

  const ballotContractFactory = new TokenizedBallot__factory(signer);
  const ballotContract = await ballotContractFactory.deploy(
    proposals.map(proposal => ethers.utils.formatBytes32String(proposal)),
    contractAddress
  );
  const deployTxReceipt = await ballotContract.deployTransaction.wait();
  console.log(`The contract was deployed at the address ${ballotContract.address} at block ${deployTxReceipt.blockNumber}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});