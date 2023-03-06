import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  let addresses: string[] = [];
  const args = process.argv;

  const ballotAddress = args[2];
  const walletAddressToCheck = args.slice(3);

  if (!ballotAddress) throw new Error("Missing ballot address");
  if (walletAddressToCheck.length <= 0) throw new Error("Missing address");
  
  walletAddressToCheck.forEach((arg, index) => {
    console.log(`Address ${index + 1}: ${arg}`);
    addresses.push(ethers.utils.getAddress(arg));
  });

  const provider = ethers.provider;
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
  /*
  const targetBlockNumber = await ballotContract.targetBlockNumber();
  console.log(`Target Block Number: ${targetBlockNumber}`);
*/
  await Promise.all(
    addresses.map(async (address) => {
      const votingPower = await ballotContract.votingPower(address);
      console.log(
        `Address: ${address} - Voting Power: ${ethers.utils.formatEther(
          votingPower
        )}`
      );
    })
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});