import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import NFTCard from "../components/NFTCard"
import { useUser } from "../contexts/UserProvider"

function MyMusic() {
    const [userNfts, setUserNfts] = useState([])
    const serverUrl = import.meta.env.VITE_SERVER_URL
    const { address, isConnected } = useWeb3ModalAccount()
    const { fetchUser } = useUser()

    useEffect(() => {
        if (!isConnected || !address) return
        async function fetchNftAddresses() {
            try {
                setUserNfts([])
                const data = await fetchUser(address)
                const nftAddresses = data.mintedNfts
                for (let i = 0; i < nftAddresses.length; i++) {
                    const nftAddress = nftAddresses[i]
                    const response = await axios.post(
                        `${serverUrl}/nft/getOne`,
                        { nftAddress },
                    )
                    const nftData = response.data.nfts[0]
                    setUserNfts((prevNfts) => [...prevNfts, nftData])
                }
            } catch (error) {
                console.error("Error fetching NFT addresses:", error)
            }
        }
        fetchNftAddresses()
    }, [isConnected, address])

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-5xl font-semibold mb-4">Your Minted Tracks</h1>
            <div className="flex flex-wrap gap-5">
                {userNfts.map((nft) => (
                    <Link
                        to={`/track/${nft.address}`}
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
        </div>
    )
}

export default MyMusic
