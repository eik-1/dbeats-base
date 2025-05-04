import { BrowserProvider, ethers } from "ethers"
import {
    factoryABI,
    factoryContractAddress,
    platformPercentageFee,
} from "../Utils/Config"

async function Mint(props) {
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

// {
//     "_type": "TransactionReceipt",
//     "blockHash": "0x4db8debcf29d4b80265116f2bd0ef1cb4dd71964bb965533e9de259ff6ba9752",
//     "blockNumber": 22409179,
//     "contractAddress": null,
//     "cumulativeGasUsed": "7057942",
//     "from": "0xF75090d9833A39Ae552eB7C1464DA1E62E7E90C4",
//     "gasPrice": "855479164",
//     "blobGasUsed": null,
//     "blobGasPrice": null,
//     "gasUsed": "24708",
//     "hash": "0x9c70b961eff35e99c93ebf7398459021dc405ee91b2a1848e5fed87a04225f54",
//     "index": 98,
//     "logs": [],
//     "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//     "status": 1,
//     "to": "0xCbDB0736971657049a02007c503c70C571bd3970"
// }
