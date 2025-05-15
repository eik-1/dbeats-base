import axios from "axios"
import React, { useEffect, useState } from "react"
import { fetchNumberOfOwners } from "../Utils/services/FetchNumberOfOwners"

export default function ProfileSongsListItem({ id, uri, mintprice, address }) {
    const [name, setName] = useState("")
    const [numberOfOwners, setNumberOfOwners] = useState(0)
    const [loading, setLoading] = useState(false)

    const serverUrl = import.meta.env.VITE_SERVER_URL

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                setLoading(true)
                const response = await axios.post(
                    `${serverUrl}/nft/nftMetadata`,
                    { uri },
                )
                const data = response.data
                setName(data.name)
                const numOwners = await fetchNumberOfOwners(address)
                setNumberOfOwners(numOwners)
            } catch (error) {
                console.error("Error fetching NFT data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNftData()
    }, [uri, address])

    return (
        <div className="h-20 w-full text-zinc-50 rounded-md hover:bg-zinc-600 p-2.5 flex items-center transition-colors duration-200">
            <div className="w-[calc(100vw-50rem)] flex items-center">
                <p className="text-lg font-medium">{id}.</p>
                <div className="flex justify-between w-full pl-[30px]">
                    <div className="flex gap-[60px] items-center w-full">
                        {loading ? (
                            <div className="flex-1 text-left text-lg font-semibold text-zinc-50">
                                Loading...
                            </div>
                        ) : (
                            <>
                                <h1 className="flex-1 text-left text-lg font-semibold text-zinc-50">
                                    {name}
                                </h1>
                                <p className="flex-1 text-zinc-300 text-md text-left">
                                    Copies sold: {numberOfOwners}
                                </p>
                                <p className="flex-1 text-md text-left rounded-3xl bg-emerald-500 text-primary-foreground px-3 py-1 font-semibold max-w-fit">
                                    {mintprice / 10 ** 18} ETH
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
