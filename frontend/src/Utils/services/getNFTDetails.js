import axios from "axios"

const serverUrl = import.meta.env.VITE_SERVER_URL

export default async function getNFTDetails(nftAddress) {
    if (nftAddress) {
        try {
            const response = await axios.post(`${serverUrl}/nft/getDetails`, {
                nftAddress,
            })
            return response.data
        } catch (error) {
            console.error("Error fetching NFT details:", error)
            throw new Error(error)
        }
    }
}
