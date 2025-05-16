import { Pause, Play } from "lucide-react"
import React, { useEffect, useState } from "react"
import axios from "axios"

import { useMusic } from "../contexts/MusicProvider"
import { Link } from "react-router-dom"
import { Spinner } from "./ui/Spinner"
// import { start } from "repl"

const serverUrl = import.meta.env.VITE_SERVER_URL

function NFTCard({ id, uri, price, genre }) {
    const initialState = {
        name: "",
        imageUrl: "",
        musicUrl: "",
        artist: "",
    }
    const [music, setMusic] = useState(initialState)
    const [loading, setLoading] = useState(true)

    const { currentTrack, isPlaying, play, pauseTrack } = useMusic()

    useEffect(() => {
        async function fetchNftData() {
            try {
                const response = await axios.post(
                    `${serverUrl}/nft/nftMetadata`,
                    { uri },
                )
                const data = response.data
                // TODO
                const music = {
                    name: data.name,
                    imageUrl: data.image, // Change this later to "data.image"
                    musicUrl: data.animation_url, // Change this later to "data.animation_url"
                    artist: data.attributes[0].value, // Change this later to "data.creator"
                }
                if(music.imageUrl.startsWith("ipfs://")) {
                    music.imageUrl = music.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
                }
                if(music.musicUrl.startsWith("ipfs://")) {
                    music.musicUrl = music.musicUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
                }
                setMusic(music)
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
            play({
                id,
                name: music.name,
                artist: music.artist,
                musicUrl: music.musicUrl,
                imageUrl: music.imageUrl,
                price,
                genre,
            })
        }
    }

    if (loading) {
        return (
            <div className="group w-[220px] h-[320px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-4 text-zinc-50 flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:border-white/30 overflow-hidden">
                <div className="w-full h-full rounded-lg flex items-center justify-center text-sm">
                    <Spinner />
                </div>
            </div>
        )
    }

    return (
        <div className="group w-[220px] h-[320px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-4 text-zinc-50 flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:border-white/30 overflow-hidden">
            <Link to={`/app/track/${id}`} key={id}>
                <div className="relative w-full h-[180px] mb-3">
                    {music.imageUrl ? (
                        <img
                            src={music.imageUrl}
                            alt={music.name || "NFT Image"}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center bg-black/30 text-white/50 text-sm">
                            No Image Available
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-opacity transition-transform duration-300 rounded-lg flex items-center justify-center"></div>
                </div>
            </Link>

            <div className="flex flex-col flex-grow overflow-hidden">
                <Link to={`/app/track/${id}`} key={id}>
                    <h3
                        className="text-base font-semibold mb-1 truncate"
                        title={music.name || "Unknown Title"}
                    >
                        {music.name || "Unknown Title"}
                    </h3>
                </Link>
                <p
                    className="text-sm text-zinc-50/70 mb-0 truncate"
                    title={music.artist}
                >
                    {music.artist}
                </p>
                <button
                    className="mt-auto bg-zinc-50/10 px-4 py-2 rounded-lg w-full hover:bg-zinc-50/20 transition-colors duration-300 flex items-center justify-center self-center"
                    onClick={handlePlayClick}
                >
                    {currentTrack && currentTrack.id === id && isPlaying ? (
                        <Pause size={26} strokeWidth={1} />
                    ) : (
                        <Play size={26} strokeWidth={1} />
                    )}
                </button>
            </div>
        </div>
    )
}

export default NFTCard
