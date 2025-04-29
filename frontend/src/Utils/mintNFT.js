import { ethers } from "ethers"
import { dbeatsNftABI } from "./Config"

async function mintNFT(nftAddress, price) {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed!")
    }
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const nftContract = new ethers.Contract(
            nftAddress,
            dbeatsNftABI,
            signer,
        )
        const tx = await nftContract.mint((await signer).address, 1, {
            value: price,
        })
        const receipt = await tx.wait(1)
        console.log("NFT minted successfully: ", receipt)
        return receipt
    } catch (err) {
        console.error("Error minting NFT: ", err)
    }
}
export default mintNFT
