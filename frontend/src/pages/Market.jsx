import { useQuery } from "@tanstack/react-query"
import React from "react"
import NFTCard from "../components/NFTCard"
import { handleFetchAllNFTs } from "../Utils/services/fetchAllNfts"
import { Spinner } from "../components/ui/Spinner"

function Market() {
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

    if (status === "pending") {
        return (
            <div className="flex justify-center items-center h-full w-full text-zinc-50">
                <Spinner />
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="h-full flex justify-center items-center text-2xl text-zinc-50 font-semibold">
                Error occurred querying the Subgraph: {error.message}
            </div>
        )
    }

    return (
        <div className="p-8">
            {status === "success" && (
                <div className="flex flex-col gap-14 w-full">
                    {Object.entries(groupedNFTs).map(([genre, nfts]) => (
                        <div key={genre}>
                            <h2 className="text-2xl text-zinc-50 font-semibold mb-6">
                                {genre}
                            </h2>
                            <div className="flex flex-wrap gap-5">
                                {nfts.map((nft) => (
                                    <NFTCard
                                        key={nft.id}
                                        id={nft.id}
                                        uri={nft.tokenURI}
                                        price={nft.mintPrice}
                                        genre={nft.genre}
                                    />
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
