import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  const args = process.argv;
  const ballotAddress = args[2];
  const selectedProposal = args[3];
  const amount = args[4];

  if (!ballotAddress) throw new Error("Missing Ballot address");
  if (!selectedProposal) throw new Error("Missing selected proposal");
  if (!amount) throw new Error("Missing amount to vote");

  //const convertedProposal = +selectedProposal;
  //const convertedAmount = ethers.utils.parseEther(amount);
  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);

  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(
    `Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} eth`
  );

  const ballotContractFactory = new TokenizedBallot__factory(signer);
  const ballotContract = ballotContractFactory.attach(ballotAddress);
  console.log(`Voted for proposal: ${selectedProposal}`);
  const voted = await ballotContract.vote(selectedProposal, amount);
  const votedTxReceipt = await voted.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});