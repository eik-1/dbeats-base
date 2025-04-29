import axios from "axios"
import React, { createContext, useContext, useRef, useState } from "react"
import { fetchNumberOfOwners } from "../Utils/FetchNumberOfOwners"

const MusicContext = createContext()

function MusicProvider({ children }) {
    // For Music Player
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef(new Audio())

    // For NFT Track Page
    const [nftDetails, setNftDetails] = useState(null)
    const [nftData, setNftData] = useState(null)
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
                const response = await fetch(`${serverUrl}/nft/getOne`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ nftAddress: address }),
                })
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                const data = await response.json()
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
        const url =
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"

        const options = {
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": import.meta.env.VITE_COINGECKO_API,
            },
        }
        try {
            const response = await axios.get(url, options)
            const data = response.data
            const exchangeRate = data.ethereum.usd
            const usdPrice = parseFloat(mintPrice / 10 ** 18) * exchangeRate
            setPriceInUSD(usdPrice.toFixed(2))
        } catch (err) {
            setPriceInUSD("N/A")
        }
    }

    async function fetchNftData(tokenURI) {
        if (tokenURI) {
            try {
                const encodedUrl = encodeURIComponent(tokenURI)
                const response = await axios.get(
                    `${serverUrl}/getData?uri=${encodedUrl}`,
                )
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
