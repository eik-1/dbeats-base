export async function fetchNumberOfOwners(address) {
    if (address) {
        const response = await fetch(
            `http://localhost:3000/numberOfOwners?address=${address}`,
        )
        const data = await response.json()
        console.log("number of owners", data)
        return data
    } else {
        console.error("No address provided.")
    }
}
