const serverUrl = import.meta.env.VITE_SERVER_URL

export async function handleFetchAllNFTs() {
    try {
        const response = await fetch(`${serverUrl}/nft/getAll`)
        const result = await response.json()
        return result
    } catch (err) {
        console.error("Error fetching data:", err)
        throw err
    }
}
