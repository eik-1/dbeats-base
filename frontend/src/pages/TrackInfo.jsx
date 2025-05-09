import { Copy, Heart, Pause, Play, Tag, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import MintModal from "../components/MintModal"
import NotConnected from "../components/NotConnected"
import { useMusic } from "../contexts/MusicProvider"
import { useUser } from "../contexts/UserProvider"
import { fetchLikes } from "../Utils/services/fetchLikes"
import { Spinner } from "../components/ui/Spinner"

function TrackInfo() {
    const location = useLocation()
    const { user } = useUser()
    const address = location.pathname.substring(11)

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
            console.log("Fetching NFT details for address:", address)
            fetchNftDetails(address)
            fetchLikes(address).then((data) => {
                if (data && data.likeCount) {
                    setLikes(data.likeCount)
                    if (data.hasLiked.includes(user.address)) {
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
            <div className="flex justify-center items-center h-full w-full text-zinc-50">
                <Spinner />
            </div>
        )

    if (error)
        return (
            <div className="flex justify-center items-center h-full w-full text-zinc-50">
                <span className="text-error">Error: {error}</span>
            </div>
        )

    return (
        <div className="mx-auto px-8 py-8 min-w-full text-zinc-50">
            {nftData && (
                <>
                    <h1 className="flex flex-row items-baseline gap-4 text-5xl font-semibold mb-10">
                        {nftDetails.nfts[0].name}
                        <Copy
                            className="cursor-pointer"
                            onClick={handleCopy}
                            strokeWidth={3}
                            size={17}
                        />
                    </h1>
                    <div className="grid md:grid-cols-[300px,1fr] gap-8">
                        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                                className="w-full h-full object-cover"
                                src={nftData.imageUrl}
                                alt={nftData.name}
                            />
                            <button
                                className="absolute bottom-4 right-2 bg-transparent backdrop-blur-md rounded-full p-4 mx-4 shadow-xl cursor-pointer"
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
                                <span className="text-2xl cursor-pointer">
                                    {nftData.attributes[0].value}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-zinc-50 rounded-full bg-emerald-900 px-3 py-1 w-fit">
                                <Tag size={18} strokeWidth={2.5} />
                                <span className="text-md">
                                    {nftDetails.nfts[0].genre}
                                </span>
                            </div>

                            <p className="text-zinc-100 leading-relaxed">
                                {nftData.description}
                            </p>

                            <div className="flex items-center gap-6 pt-4">
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

                            <div className="flex items-center justify-start gap-32 max-w-fit rounded-lg px-4 py-3 bg-zinc-950">
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
                                    className="bg-emerald-500 text-zinc-50 px-6 py-2  rounded-full font-medium hover:opacity-90 transition-opacity"
                                >
                                    Mint Track
                                </button>
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
