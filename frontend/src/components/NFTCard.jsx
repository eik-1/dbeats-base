import { Pause, Play } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useMusic } from "../contexts/MusicProvider"

function NFTCard({ id, uri, price, genre }) {
    const [name, setName] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [musicUrl, setMusicUrl] = useState("")
    const [artist, setArtist] = useState("")
    const [loading, setLoading] = useState(true)

    const { currentTrack, isPlaying, play, pauseTrack } = useMusic()

    useEffect(() => {
        async function fetchNftData() {
            try {
                const response = await fetch(
                    `http://localhost:3000/nft/nftMetadata?uri=${encodeURIComponent(uri)}`,
                )
                const data = await response.json()
                setName(data.name)
                setImageUrl(data.imageUrl)
                setMusicUrl(data.animationUrl)
                setArtist(data.attributes[0].value)
            } catch (error) {
                console.error("Error fetching NFT data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchNftData()
    }, [uri])

    function handlePlayClick() {
        if (currentTrack && currentTrack.id === id && isPlaying) {
            pauseTrack()
        } else {
            play({ id, name, artist, musicUrl, imageUrl, price, genre })
        }
    }

    if (loading) {
        return (
            <div className="skeleton card w-[250px] h-[250px] overflow-hidden group"></div>
        )
    }

    return (
        <div className="card w-[250px] h-[250px] overflow-hidden cursor-pointer group">
            <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
            <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 h-2/5 flex justify-between items-center gap-4 text-neutral-content opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="font-bold p-4">
                    <h1 className="text-lg text-neutral-content">{name}</h1>
                    <h2>{artist}</h2>
                </div>
                <button
                    className="absolute top-1/2 left-[85%] transform -translate-x-1/2 -translate-y-1/2 bg-base-100 text-neutral rounded-full p-2"
                    onClick={handlePlayClick}
                >
                    {currentTrack && currentTrack.id === id && isPlaying ? (
                        <Pause size={23} fill="#000" />
                    ) : (
                        <Play size={23} fill="#000" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default NFTCard
