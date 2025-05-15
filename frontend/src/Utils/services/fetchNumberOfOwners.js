const serverUrl = import.meta.env.VITE_SERVER_URL

export default async function fetchNumberOfOwners(address) {
    if (address) {
        const response = await fetch(
            `${serverUrl}/nft/numberOfOwners?address=${address}`,
        )
        const data = await response.json()
        return data
    } else {
        console.error("No address provided.")
    }
}
