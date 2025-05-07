require("dotenv").config();
const NftAddress = "0x4d4568fceb7668ab9ab0253fea8c8ed30b8400b7";
const ethers = require('ethers');
const {abi} = require('./abi');
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const Signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const nftContractInstance = new ethers.Contract(NftAddress, abi, Signer);

async function main() {
    const mintPrice = await nftContractInstance._mintPrice();
    console.log(mintPrice);
    const mint = await nftContractInstance.mint(Signer.address, 1, { value: mintPrice });
    console.log(mint);
    console.log("Transaction Hash: ", mint.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });