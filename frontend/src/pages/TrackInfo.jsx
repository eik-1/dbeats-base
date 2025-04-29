import { Copy, Heart, Pause, Play, Tag, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import MintModal from "../components/MintModal"
import NotConnected from "../components/NotConnected"
import { useMusic } from "../contexts/MusicProvider"
import { fetchLikes } from "../Utils/FetchLikes"
import UserAddress from "../Utils/UserAddress"

function TrackInfo() {
    const location = useLocation()
    const userAddress = UserAddress()
    const { address } = location.state || {}
    const {
        // For Music Player
        currentTrack,
        isPlaying,
        play,
        // For Track Info
        pauseTrack,
        nftDetails,
        nftData,
        loading,
        error,
        numberOfOwners,
        priceInUSD,
        fetchNftDetails,
    } = useMusic()
    const [isMintModalOpen, setIsMintModalOpen] = useState(false)
    const [likes, setLikes] = useState(0)
    const [hasliked, setHasliked] = useState(false)
    const { isConnected } = useWeb3ModalAccount()

    useEffect(() => {
        if (address) {
            fetchNftDetails(address)
            fetchLikes(address).then((data) => {
                if (data && data.likeCount) {
                    setLikes(data.likeCount)
                    if (data.hasLiked.includes(userAddress)) {
                        setHasliked(true)
                        console.log(hasliked)
                    }
                }
            })
        }
    }, [address, hasliked, likes])

    function handlePlayClick() {
        if (
            currentTrack &&
            currentTrack.id === nftDetails.nfts[0].address &&
            isPlaying
        ) {
            pauseTrack()
        } else {
            const trackData = {
                id: nftDetails.nfts[0].address,
                name: nftDetails.nfts[0].name,
                artist: nftData.attributes[0].value,
                musicUrl: nftData.animationUrl,
                imageUrl: nftData.imageUrl,
                price: nftDetails.nfts[0].mintPrice,
                genre: nftDetails.nfts[0].genre,
            }
            play(trackData)
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(nftDetails.nfts[0].address)
    }

    function handleMintClick() {
        setIsMintModalOpen(true)
    }

    function handleCloseMintModal() {
        setIsMintModalOpen(false)
    }

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-dvh w-full">
                <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
        )
    if (error)
        return (
            <div className="flex justify-center items-center min-h-dvh w-full">
                <span className="text-error">Error: {error}</span>
            </div>
        )

    return (
        <div className="mx-auto px-8 py-8 min-w-full text-base-content">
            {nftData && (
                <>
                    <h1 className="flex flex-row items-baseline gap-4 text-5xl font-acidBold mb-10">
                        {nftDetails.nfts[0].name}
                        <Copy onClick={handleCopy} size={17} />
                    </h1>
                    <div className="grid md:grid-cols-[300px,1fr] gap-8">
                        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                                className="w-full h-full object-cover"
                                src={nftData.imageUrl}
                                alt={nftData.name}
                            />
                            <button
                                className="absolute bottom-4 right-2 bg-primary text-base-100 rounded-full p-4 mx-4 shadow-lg cursor-pointer "
                                onClick={handlePlayClick}
                            >
                                {isPlaying ? (
                                    <Pause size={26} fill="#fff" />
                                ) : (
                                    <Play size={26} fill="#fff" />
                                )}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <User size={24} />
                                <span className="text-2xl font-acidBold cursor-pointer">
                                    {nftData.attributes[0].value}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-accent-content rounded-full bg-accent px-3 py-1 w-fit">
                                <Tag size={18} />
                                <span className="text-md">
                                    {nftDetails.nfts[0].genre}
                                </span>
                            </div>

                            <p className="font-acidRegular text-md leading-relaxed">
                                {nftData.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">
                                        {(
                                            nftDetails.nfts[0].mintPrice /
                                            10 ** 18
                                        ).toFixed(4)}{" "}
                                        ETH
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ${priceInUSD}
                                    </div>
                                </div>

                                <button
                                    onClick={handleMintClick}
                                    className="bg-primary text-base-100 px-6 py-2 mx-10 rounded-full font-medium hover:opacity-90 transition-opacity"
                                >
                                    Mint Track
                                </button>
                            </div>

                            <div className="flex items-center gap-6 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Heart size={20} />
                                    <span className="text-sm">
                                        {likes} likes
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {numberOfOwners} minted
                                </div>
                            </div>
                        </div>
                    </div>
                    {isConnected ? (
                        nftData &&
                        nftDetails && (
                            <MintModal
                                isOpen={isMintModalOpen}
                                onClose={handleCloseMintModal}
                                currentTrack={{
                                    id: nftDetails.nfts[0].address,
                                    name: nftDetails.nfts[0].name,
                                    artist: nftData.attributes[0].value,
                                    imageUrl: nftData.imageUrl,
                                    price: nftDetails.nfts[0].mintPrice,
                                    genre: nftDetails.nfts[0].genre,
                                }}
                            />
                        )
                    ) : (
                        <NotConnected
                            isOpen={isMintModalOpen}
                            onClose={handleCloseMintModal}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default TrackInfo
