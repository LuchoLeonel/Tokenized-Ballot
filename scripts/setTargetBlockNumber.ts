import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  const args = process.argv;
  const ballotAddress = args[2];
  const targetBlockNumber = args[3];

  if (!ballotAddress) throw new Error("Missing ballot address");
  if (!targetBlockNumber) throw new Error("Missing ballot address");
  
  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);

  const ballotContractFactory = new TokenizedBallot__factory(signer);
  const ballotContract = ballotContractFactory.attach(ballotAddress);
  
  const changeTargetBlockNumberTx = await ballotContract.setTargetBlockNumber(targetBlockNumber);
  await changeTargetBlockNumberTx.wait();
  console.log(`New Target Block Number is: ${await ballotContract.targetBlockNumber()}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});