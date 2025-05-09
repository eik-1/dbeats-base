import { useQuery } from "@tanstack/react-query"
import React from "react"
import { Link } from "react-router-dom"
import NFTCard from "../components/NFTCard"

const serverUrl = import.meta.env.VITE_SERVER_URL

function Market() {
    async function handleFetchAllNFTs() {
        try {
            const response = await fetch(`${serverUrl}/nft/getAll`)
            const result = await response.json()
            return result
        } catch (err) {
            console.error("Error fetching data:", err)
            throw err
        }
    }

    const { data, status, error } = useQuery({
        queryKey: ["nfts"],
        queryFn: handleFetchAllNFTs,
    })

    const groupByGenre = (nfts) => {
        return nfts.reduce((acc, nft) => {
            const { genre } = nft
            if (!acc[genre]) {
                acc[genre] = []
            }
            acc[genre].push(nft)
            return acc
        }, {})
    }

    const groupedNFTs = data?.nfts ? groupByGenre(data.nfts) : {}

    return (
        <div className="p-6 md:p-8 h-full">
            {status === "pending" && (
                <div className="flex justify-center items-center h-screen w-full">
                    <span className="loading loading-spinner text-primary loading-lg"></span>
                </div>
            )}
            {status === "error" && (
                <div className="text-center text-lg text-error mt-8 font-medium">
                    Error occurred querying the Subgraph: {error.message}
                </div>
            )}
            {status === "success" && (
                <div className="space-y-8">
                    {Object.entries(groupedNFTs).map(([genre, nfts]) => (
                        <div key={genre}>
                            <h2 className="text-xl font-bold mb-4">{genre}</h2>
                            <div className="flex flex-wrap gap-5">
                                {nfts.map((nft) => (
                                    <Link
                                        to={`/app/track/${nft.address}`}
                                        state={{ address: nft.address }}
                                        key={nft.id}
                                    >
                                        <NFTCard
                                            id={nft.id}
                                            uri={nft.tokenURI}
                                            price={nft.mintPrice}
                                            genre={nft.genre}
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Market
