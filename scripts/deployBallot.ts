import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
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
  const blockNumber = parseInt(args[3]);
  const proposals = args.slice(4);
  
  if (!contractAddress) throw new Error("Missing contract address");
  if (!blockNumber) throw new Error("Missing block number");
  if (!proposals.length) throw new Error("Missing proposals");

  const provider = ethers.provider;

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

  const ballotContractFactory = new Ballot__factory(signer);
  const ballotContract = await ballotContractFactory.deploy(
    proposals.map(proposal => ethers.utils.formatBytes32String(proposal)),
    contractAddress,
    blockNumber
  );
  const deployTxReceipt = await ballotContract.deployTransaction.wait();
  console.log(`The contract was deployed at the address ${ballotContract.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});