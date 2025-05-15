const hre = require("hardhat");

async function main() {
  const deploymentData = require('../ignition/deployments/chain-8453/deployed_addresses.json');

  const contracts = {
    DBeatsPlatformWallet: deploymentData["MainModule#DBeatsPlatformWallet"],
    FeeManager: deploymentData["MainModule#FeeManager"],
    Platform: deploymentData["MainModule#Platform"],
    DBeatsFactory: deploymentData["MainModule#DBeatsFactory"],
  };

  const owners = ["0xb7E9eC6add9cbf3c0571dF5746e54d0aa23932f5","0x143C4BEEf05eeB3eFb9062A96Af96C0564d3FBd4"];
  const requiredConfirmations = 2;
  const initialFeePercentage = 10;

  console.log("Verifying DBeatsPlatformWallet...");
  await hre.run("verify:verify", {
    address: contracts.DBeatsPlatformWallet,
    constructorArguments: [owners, requiredConfirmations],
  });

  console.log("Verifying FeeManager...");
  await hre.run("verify:verify", {
    address: contracts.FeeManager,
    constructorArguments: [initialFeePercentage],
  });

  console.log("Verifying Platform...");
  await hre.run("verify:verify", {
    address: contracts.Platform,
    constructorArguments: [contracts.DBeatsPlatformWallet],
  });

  console.log("Verifying DBeatsFactory...");
  await hre.run("verify:verify", {
    address: contracts.DBeatsFactory,
    constructorArguments: [contracts.DBeatsPlatformWallet, contracts.FeeManager],
  });

  console.log("All contracts verified successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });