const { ethers } = require('hardhat')
const fs = require('fs')
const dotenv = require('dotenv')

// Load environment variables from .env file
dotenv.config()

const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS

// Main function to deploy contracts
async function main() {
    // const Artist = await ethers.getContractFactory("DBeatsArtist");
    // console.log("Deploying DBeatsArtist...");
    // const artist = await Artist.deploy();
    // console.log("Artist Address", artist.address);
    const Factory = await ethers.getContractFactory('DBeatsFactory')
    console.log('Deploying DBeatsFactory...')
    const factory = await Factory.deploy(platformWalletAddress)
    console.log('Factory Address', factory.address)
    const details = { factory: factory.address }
    const content = 'module.exports = ' + JSON.stringify(details, null, 2) + ';'
    fs.writeFileSync('./ContractDetails.js', content)
}

// Execute the main function
main()
    .then(() => process.exit(0)) // Exit with success status
    .catch((error) => {
        // Log error and exit with failure status
        console.error(error)
        process.exit(1)
    })
