import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory, MyToken__factory } from "../typechain-types";
import { expect } from "chai";
dotenv.config();

async function main() {
  const args = process.argv;
  const tokenizedBallotAddress = args[2];
  const destinationAddress = args[3];
  const amount = args[4];
  if (!tokenizedBallotAddress) throw new Error("Missing tokenized ballot contract address");
  if (!destinationAddress) throw new Error("Missing destination address");
  if (!amount) throw new Error("Missing amount");

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0) throw new Error("Missing private key, check .env file");
  
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);

  const tokenizedBallotContractFactory = new TokenizedBallot__factory(signer);
  const tokenizedBallotContract = tokenizedBallotContractFactory.attach(tokenizedBallotAddress);

  const parsedAmount = ethers.utils.parseEther(amount);
  const giveVotesTx = await tokenizedBallotContract.giveVotes(destinationAddress, parsedAmount);
  await giveVotesTx.wait();

  const tokenContractAddress = await tokenizedBallotContract.tokenContract();
  const tokenContractFactory = new MyToken__factory(signer);
  const tokenContract = tokenContractFactory.attach(tokenContractAddress);

  const balance = await tokenContract.balanceOf(destinationAddress);
  console.log(`${destinationAddress} now has ${ethers.utils.formatEther(balance)} tokens`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});