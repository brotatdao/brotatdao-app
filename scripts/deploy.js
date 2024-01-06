import hre from "hardhat";
import { parseEther } from "ethers";

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function main() {
  // Parameters
  const registrationFee = parseEther("0.01"); // 0.01 ETH in wei
  const erc20TokenAddress = "0x7DBC94BFDeE135BC356926766FD81974118208f5"; // Revise to Treasury for production
  const nameWrapperAddress = "0x0635513f179D50A207757E05759CbD106d7dFcE8"; // Revise to mainnet for production
  // Mainnet wrapper address: 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401

  // Deploy FixedPricer
  const FixedPricer = await hre.ethers.getContractFactory("FixedPricer");
  const fixedPricer = await FixedPricer.deploy(registrationFee, erc20TokenAddress);

  await fixedPricer.deployed();
  console.log(`FixedPricer deployed to: ${fixedPricer.address}`);

  // Deploy ForeverSubdomainRegistrar
  const ForeverSubdomainRegistrar = await hre.ethers.getContractFactory("ForeverSubdomainRegistrar");
  const foreverSubdomainRegistrar = await ForeverSubdomainRegistrar.deploy(nameWrapperAddress);
  
  await foreverSubdomainRegistrar.deployed();
  console.log(`ForeverSubdomainRegistrar deployed to: ${foreverSubdomainRegistrar.address}`);

  // Delay for etherscan (sleep function above)
  await sleep(45 * 1000);

  // Verify ForeverSubdomainRegistrar with etherscan
  await hre.run("verify:verify", {
    address: foreverSubdomainRegistrar.address,
    constructorArguments: [] // Add constructor arguments if any
  });

  // Verify FixedPricer with etherscan
  await hre.run("verify:verify", {
    address: fixedPricer.address,
    constructorArguments: [] // Add constructor arguments if any
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
