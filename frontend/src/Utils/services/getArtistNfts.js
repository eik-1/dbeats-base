const serverUrl = import.meta.env.VITE_SERVER_URL

export default async function getArtistNfts(artistAddress) {
    if (artistAddress) {
        console.log("Fetching data for artistId:", artistAddress)
        try {
            const response = await fetch(
                `${serverUrl}/userNfts?walletAddress=${artistAddress}`,
            )
            const result = await response.json()
            console.log("Response from server:", result)
            return result
        } catch (err) {
            console.error("Error fetching data:", err)
            throw err
        }
    }
}
