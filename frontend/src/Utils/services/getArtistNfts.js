const serverUrl = import.meta.env.VITE_SERVER_URL

export default async function getArtistNfts(artistAddress) {
    if (artistAddress) {
        try {
            const response = await fetch(
                `${serverUrl}/nft/artistNfts?walletAddress=${artistAddress}`,
            )
            const result = await response.json()
            return result
        } catch (err) {
            console.error("Error fetching data:", err)
            throw err
        }
    }
}
