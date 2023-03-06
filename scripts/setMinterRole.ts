import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken__factory } from "../typechain-types";
import { expect } from "chai";
dotenv.config();

async function main() {
  const args = process.argv;
  const tokenAddress = args[2];
  const tokenizedBallotAddress = args[3];
  if (!tokenAddress) throw new Error("Missing token contract address");
  if (!tokenizedBallotAddress) throw new Error("Missing tokenized ballot contract address");

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.length <= 0) throw new Error("Missing private key, check .env file");
  
  const wallet = new ethers.Wallet(privateKey);
  console.log(`Connected to wallet address ${wallet.address}`);

  const signer = wallet.connect(provider);

  const myTokenContractFactory = new MyToken__factory(signer);
  const tokenContract = myTokenContractFactory.attach(tokenAddress);

  const setMintRoleTx = await tokenContract.setMinterRoles(tokenizedBallotAddress);
  await setMintRoleTx.wait();

  const minterRole = await tokenContract.MINTER_ROLE();
  const hasMinterRole = await tokenContract.hasRole(minterRole, tokenizedBallotAddress);

  expect(hasMinterRole).to.eq(true);
  console.log(`Address ${tokenizedBallotAddress} now has the Minter Role`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});