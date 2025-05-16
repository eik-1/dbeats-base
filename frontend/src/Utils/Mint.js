import { BrowserProvider, ethers } from "ethers"
import { factoryABI, factoryContractAddress } from "../Utils/Config"

async function Mint(props) {
    console.log("mint props: ", props)
    await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [props.user.toLowerCase()],
    })
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
                // props.maxMintLimit,
                0,
            )

        const tx = await factoryContractInstanceWithSigner.createNFT(
            props.user,
            props.uri,
            props.name,
            props.symbol,
            props.price,
            props.genre,
            // props.maxMintLimit,
            0,
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
            maxMintLimit
        } = newNFTEvent.args

        const eventData = {
            nftAddress,
            artistAddress,
            newTokenURI,
            name,
            symbol,
            mintPrice: mintPrice.toString(),
            genre,
            maxMintLimit: maxMintLimit.toString(),
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
//     "nftAddress": "0x5468E55c9b2b394D162faB0817Db5e164097F843",
//     "artistAddress": "0xdb035c42e12ee11f1D47797954C25EE36C3dC77c",
//     "newTokenURI": "ipfs://bafkreic7pwkq7d6w2lwjwtwbyfm7coyrliva2dxy5ypglbjif7mphfco3u",
//     "name": "Sigar We're Going Down",
//     "symbol": "DBNFT",
//     "mintPrice": "100000000000000",
//     "genre": "Rock"
// }
