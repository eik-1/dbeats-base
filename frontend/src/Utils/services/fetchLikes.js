const serverUrl = import.meta.env.VITE_SERVER_URL

export async function fetchLikes(address) {
    if (address) {
        console.log("fetching likes")
        const response = await fetch(
            `${serverUrl}/nft/likes?address=${address}`,
        )
        const data = await response.json()
        return data
    } else {
        console.error("No address provided.")
    }
}
