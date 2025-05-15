import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import NFTCard from "../components/NFTCard"
import { useUser } from "../contexts/UserProvider"
import { Spinner } from "../components/ui/Spinner"

function MyMusic() {
    const [userNfts, setUserNfts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { address, isConnected } = useWeb3ModalAccount()
    const { fetchUser } = useUser()

    const serverUrl = import.meta.env.VITE_SERVER_URL

    useEffect(() => {
        if (!isConnected || !address) {
            setLoading(false)
            setUserNfts([])
            return
        }

        async function fetchUserAndNftDetails() {
            setLoading(true)
            setError(null)

            try {
                const userData = await fetchUser(address)
                if (
                    !userData ||
                    !userData.mintedNfts ||
                    userData.mintedNfts.length === 0
                ) {
                    setUserNfts([])
                    setLoading(false)
                    return
                }
                const nftAddresses = userData.mintedNfts

                const nftDetailsPromises = nftAddresses.map((nftAddress) =>
                    axios.post(`${serverUrl}/nft/getDetails`, { nftAddress }),
                )

                const nftDetailsResponses =
                    await Promise.all(nftDetailsPromises)

                const fetchedNfts = nftDetailsResponses
                    .map((response) => {
                        if (
                            response.data &&
                            response.data.nfts &&
                            response.data.nfts.length > 0
                        ) {
                            return response.data.nfts[0]
                        }
                        console.warn(
                            "Unexpected response structure or empty NFT data for an address:",
                            response.data,
                        )
                        return null
                    })
                    .filter((nft) => nft !== null)

                setUserNfts(fetchedNfts)
            } catch (err) {
                console.error("Error fetching user's minted NFTs:", err)
                setError(err.message || "Failed to fetch minted NFTs.")
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndNftDetails()
    }, [isConnected, address])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full text-zinc-50">
                <Spinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-full flex justify-center items-center text-2xl text-zinc-50 font-semibold p-8">
                Error: {error}
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-semibold mb-6 text-zinc-50">
                Your Minted Tracks
            </h1>
            {userNfts.length > 0 ? (
                <div className="flex flex-wrap gap-5">
                    {userNfts.map((nft) => (
                        <Link
                            to={`/app/track/${nft.address}`}
                            state={{ address: nft.address }}
                            key={nft.address}
                            className=""
                        >
                            <NFTCard
                                key={nft.id}
                                id={nft.id}
                                uri={nft.tokenURI}
                                price={nft.mintPrice}
                                genre={nft.genre}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-50 text-lg">
                    You haven't minted any tracks yet.
                </p>
            )}
        </div>
    )
}

export default MyMusic
