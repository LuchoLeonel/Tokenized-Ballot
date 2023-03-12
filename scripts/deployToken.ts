import { ethers, run } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken__factory } from "../typechain-types";

dotenv.config();

async function main() {
  const args = process.argv;

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey || privateKey.length <= 0)
    throw new Error("Missing private key, please check .env file");
  const wallet = new ethers.Wallet(privateKey); 
  console.log(`Connected to wallet address ${wallet.address}`);
  const signer = wallet.connect(provider);
  const balance = await signer.getBalance();
  console.log(`Wallet balance: ${balance} Wei, ${ethers.utils.formatEther(balance)} eth`);

  console.log("Deploying token contract");

  const tokenContractFactory = new MyToken__factory(signer);
  const tokenContract = await tokenContractFactory.deploy();
  const deployTxReceipt = await tokenContract.deployTransaction.wait();
  console.log(`The token contract was deployed at the address ${tokenContract.address} at block ${deployTxReceipt.blockNumber}`);
  const contractName = await tokenContract.name();
  const contractSymbol = await tokenContract.symbol();
  const contractDecimals = await tokenContract.decimals();
  let totalSupply = await tokenContract.totalSupply();
  console.log(`The contract name is ${contractName} \nThe contract symbol is ${contractSymbol} \nThe total supply is ${totalSupply} decimal units \nThe decimals units is ${contractDecimals}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});