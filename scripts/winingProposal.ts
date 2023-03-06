import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  let addresses: string[] = [];
  const args = process.argv;

  const ballotAddress = args[2];

  if (!ballotAddress) throw new Error("Missing ballot address");

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} eth`);

  const ballotContractFactory = new TokenizedBallot__factory(signer);
  const ballotContract = ballotContractFactory.attach(ballotAddress);
  
  const winnerProposal = await ballotContract.winnerName();
  console.log(`Winner proposal is: ${ethers.utils.parseBytes32String(winnerProposal)}`);

}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});