const serverUrl = import.meta.env.VITE_SERVER_URL

export async function fetchNumberOfOwners(address) {
    if (address) {
        const response = await fetch(
            `${serverUrl}/nft/numberOfOwners?address=${address}`,
        )
        const data = await response.json()
        console.log("number of owners", data)
        return data
    } else {
        console.error("No address provided.")
    }
}
