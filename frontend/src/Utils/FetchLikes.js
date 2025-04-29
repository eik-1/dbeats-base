export async function fetchLikes(address) {
    if (address) {
        console.log("fetching likes")
        const response = await fetch(
            `http://localhost:3000/nft/likes?address=${address}`,
        )
        const data = await response.json()
        return data
    } else {
        console.error("No address provided.")
    }
}
