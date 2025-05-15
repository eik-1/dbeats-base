import axios from "axios"
import React, { createContext, useContext, useRef, useState } from "react"
import { fetchNumberOfOwners } from "../Utils/services/FetchNumberOfOwners"

const MusicContext = createContext()

function MusicProvider({ children }) {
    // For Music Player
    const [currentTrack, setCurrentTrack] = useState(null) // Current track being played
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef(new Audio()) // Reference to the audio player in MusicPlayer

    // For NFT Track Page
    const [nftDetails, setNftDetails] = useState(null) // Details include address, name, price, uri, genre
    const [nftData, setNftData] = useState(null) // Get metadata from the uri which includes image, audio, description, artist name, etc.
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [numberOfOwners, setNumberOfOwners] = useState(null)
    const [priceInUSD, setPriceInUSD] = useState(null)

    const serverUrl = import.meta.env.VITE_SERVER_URL

    function play(track) {
        if (currentTrack && currentTrack.id === track.id) {
            resumeTrack()
        } else {
            setCurrentTrack(track)
            audioRef.current.src = track.musicUrl
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    function pauseTrack() {
        audioRef.current.pause()
        setIsPlaying(false)
    }

    function resumeTrack() {
        audioRef.current.play()
        setIsPlaying(true)
    }

    function seekTo(time) {
        audioRef.current.currentTime = time
    }

    function setVolume(level) {
        audioRef.current.volume = level
    }

    async function fetchNftDetails(address) {
        if (address) {
            try {
                const response = await axios.post(
                    `${serverUrl}/nft/getDetails`,
                    { nftAddress: address },
                )

                if (response.status !== 200) {
                    throw new Error("Network response was not ok")
                }
                const data = response.data
                setNftDetails(data)

                const owners = await fetchNumberOfOwners(address)
                setNumberOfOwners(owners)

                await fetchExchangeRate(data.nfts[0].mintPrice)

                await fetchNftData(data.nfts[0].tokenURI)
            } catch (err) {
                console.error("Error fetching NFT details:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        } else {
            setError("No address provided")
            setLoading(false)
        }
    }

    async function fetchExchangeRate(mintPrice) {
        try {
            const response = await axios.post(
                `${serverUrl}/nft/getExchangeRate`,
                {
                    mintPrice,
                },
            )
            const data = response.data
            setPriceInUSD(data.usdPrice.toFixed(2))
        } catch (err) {
            setPriceInUSD("N/A")
        }
    }

    async function fetchNftData(tokenURI) {
        if (tokenURI) {
            try {
                const response = await axios.post(
                    `${serverUrl}/nft/nftMetadata`,
                    {
                        uri: tokenURI,
                    },
                )
                if (response.status !== 200) {
                    throw new Error("Network response was not ok")
                }
                const data = response.data
                setNftData(data)
            } catch (err) {
                console.error("Error fetching NFT data:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        } else {
            console.error("No tokenURI provided.")
            setLoading(false)
        }
    }

    return (
        <MusicContext.Provider
            value={{
                currentTrack,
                isPlaying,
                play,
                pauseTrack,
                resumeTrack,
                seekTo,
                setVolume,
                audioRef,
                nftDetails,
                nftData,
                loading,
                error,
                numberOfOwners,
                priceInUSD,
                fetchExchangeRate,
                fetchNftDetails,
            }}
        >
            {children}
        </MusicContext.Provider>
    )
}

function useMusic() {
    const context = useContext(MusicContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}

export { MusicProvider, useMusic }
