const { ethers } = require("hardhat");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const PlatformFeePercentage = 10;
// Main function to deploy contracts
async function main() {
  const FeeManager = await ethers.getContractFactory("FeeManager");
  console.log("Deploying FeeManager...");
  const feeManager = await FeeManager.deploy(PlatformFeePercentage);
  console.log("Factory Address", feeManager.address);
  const details = { feeManager: feeManager.address };
  const content = "module.exports = " + JSON.stringify(details, null, 2) + ";";
  fs.writeFileSync("./ContractDetails.js", content);
}

// Execute the main function
main()
  .then(() => process.exit(0)) // Exit with success status
  .catch((error) => {
    // Log error and exit with failure status
    console.error(error);
    process.exit(1);
  });
