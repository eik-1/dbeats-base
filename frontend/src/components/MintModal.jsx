import { ethers } from "ethers"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"

import { useUser } from "../contexts/UserProvider.jsx"
import mintNFT from "../Utils/mintNFT.js"
import RainbowButton from "./ui/RainbowButton.jsx"

function MintModal({ isOpen, onClose, currentTrack }) {
    const price = currentTrack.price
    const priceFormat = ethers.formatEther(price)
    const genre = currentTrack.genre

    const [priceInUSD, setPriceInUSD] = useState("")
    const [isMinting, setIsMinting] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const { addNftToUser } = useUser()
    const dialogRef = useRef(null)
    const { width, height } = useWindowSize()

    const navigate = useNavigate()

    const serverUrl = import.meta.env.VITE_SERVER_URL

    useEffect(() => {
        if (isOpen) {
            fetchExchangeRate()
            if (dialogRef.current) {
                dialogRef.current.showModal()
            }
        } else {
            if (dialogRef.current) {
                dialogRef.current.close()
            }
        }
    }, [isOpen])

    async function fetchExchangeRate() {
        const response = await axios.post(`${serverUrl}/nft/getExchangeRate`, {
            mintPrice: price,
        })
        const data = response.data
        console.log(data)
        setPriceInUSD(data.usdPrice.toFixed(2))
    }

    async function handleMint() {
        setShowConfetti(true)
        setIsMinting(true)
        try {
            const priceInWei = ethers.parseEther(priceFormat)
            const receipt = await mintNFT(currentTrack.id, priceInWei)
            if (!receipt) {
                throw new Error("Minting failed")
            }
            console.log("Minting successful:", receipt)
            const nftAddress = currentTrack.id
            await addNftToUser(nftAddress)
            console.log("Saved to the database")
        } catch (error) {
            console.error("Error minting NFT:", error)
        } finally {
            setIsMinting(false)
        }
    }

    function handleArtistNav() {
        dialogRef.current.close()
        navigate(`/app/${currentTrack.artist}`)
    }

    function handleCopy() {
        navigator.clipboard.writeText(currentTrack.id)
    }

    return (
        <>
            {isOpen && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" />
            )}
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 9999,
                    }}
                />
            )}
            <dialog
                ref={dialogRef}
                className="bg-zinc-900 text-zinc-50 w-[400px] p-4 rounded-lg shadow-xl relative overflow-visible"
            >
                <div className="relative z-[2] flex flex-col h-fit">
                    <div className="relative pt-[80%]">
                        <div className="absolute w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <img
                                src={currentTrack.imageUrl}
                                alt={currentTrack.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div
                                variant="secondary"
                                className="absolute top-2 right-2 rounded-3xl bg-emerald-500 px-3 py-1 text-sm backdrop-blur-sm border-0"
                            >
                                {genre}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-5">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-semibold">
                                {currentTrack.name}
                            </h3>
                            <p
                                className="cursor-pointer w-fit hover:text-zinc-400 transition-colors"
                                onClick={handleArtistNav}
                            >
                                {currentTrack.artist}
                            </p>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg bg-zinc-800 text-zinc-50">
                            <div className="space-y-2">
                                <p className="text-xl font-semibold ">
                                    Current Price
                                </p>
                                <div className="flex gap-5 items-center">
                                    <p className="text-lg">{priceFormat} ETH</p>
                                    <p className="text-md">
                                        (${priceInUSD} USD)
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xl font-semibold">
                                    Contract Address
                                </p>
                                <div className="flex items-center justify-between bg-zinc-500 p-3 rounded-lg">
                                    <p
                                        className="text-sm font-mono truncate cursor-pointer"
                                        onClick={handleCopy}
                                    >
                                        {currentTrack.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <RainbowButton
                                onClick={handleMint}
                                disabled={isMinting}
                            >
                                {isMinting ? "Minting..." : "Mint NFT"}
                            </RainbowButton>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-red-500 text-zinc-50 py-3 px-4 rounded-3xl hover:bg-red-600 hover:bg-opacity-90 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    )
}

export default MintModal
