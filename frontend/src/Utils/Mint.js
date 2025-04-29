import { BrowserProvider, ethers } from "ethers"
import {
    factoryABI,
    factoryContractAddress,
    platformPercentageFee,
} from "../Utils/Config"

const Mint = async (props) => {
    console.log("mint props: ", props)

    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const factoryContractInstanceWithSigner = new ethers.Contract(
        factoryContractAddress,
        factoryABI,
        signer,
    )

    try {
        const gasEstimate =
            await factoryContractInstanceWithSigner.createNFT.estimateGas(
                props.user,
                props.uri,
                props.name,
                props.symbol,
                props.price,
                props.genre,
            )

        const tx = await factoryContractInstanceWithSigner.createNFT(
            props.user,
            props.uri,
            props.name,
            props.symbol,
            props.price,
            props.genre,
            {
                gasLimit: gasEstimate,
            },
        )

        console.log("Transaction sent, waiting for confirmation...")
        const receipt = await tx.wait()
        console.log("Transaction confirmed:", receipt)

        // Find the NewNFT event in the receipt
        const newNFTEvent = receipt.logs
            .map((log) => {
                try {
                    return factoryContractInstanceWithSigner.interface.parseLog(
                        {
                            topics: log.topics,
                            data: log.data,
                        },
                    )
                } catch (e) {
                    return null
                }
            })
            .find((event) => event && event.name === "NewNFT")

        if (!newNFTEvent) {
            throw new Error("NewNFT event not found in transaction receipt")
        }

        const {
            nftAddress,
            _artistAddress: artistAddress,
            _newTokenURI: newTokenURI,
            name,
            symbol,
            mintPrice,
            _genre: genre,
        } = newNFTEvent.args

        const eventData = {
            nftAddress,
            artistAddress,
            newTokenURI,
            name,
            symbol,
            mintPrice: mintPrice.toString(),
            genre,
        }

        console.log("NewNFT Event Data:", eventData)
        return eventData
    } catch (error) {
        console.log("error: ", error)
        throw error
    }
}

export default Mint
