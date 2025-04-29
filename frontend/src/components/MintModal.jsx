import { ethers } from "ethers"
import { Copy } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useUser } from "../contexts/UserProvider.jsx"
import mintNFT from "../Utils/mintNFT.js"
import RainbowButton from "./ui/RainbowButton.jsx"

function MintModal({ isOpen, onClose, currentTrack }) {
    const price = currentTrack.price
    const priceFormat = ethers.formatEther(price)
    const genre = currentTrack.genre

    const [priceInUSD, setPriceInUSD] = useState("")
    const [isMinting, setIsMinting] = useState(false)
    const dialogRef = useRef(null)
    const { addNftToUser } = useUser()

    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen) {
            fetchExchangeRate()
            dialogRef.current.showModal()
        } else {
            dialogRef.current.close()
        }
    }, [isOpen])

    async function fetchExchangeRate() {
        const url =
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": import.meta.env.VITE_COINGECKO_API,
            },
        }
        try {
            const response = await fetch(url, options)
            const data = await response.json()
            const exchangeRate = data.ethereum.usd
            const usdPrice = parseFloat(priceFormat) * exchangeRate
            setPriceInUSD(usdPrice.toFixed(2))
        } catch (error) {
            console.error("Error fetching exchange rate:", error)
            setPriceInUSD("N/A")
        }
    }

    async function handleMint() {
        setIsMinting(true)
        try {
            const priceInWei = ethers.parseEther(priceFormat)
            const receipt = await mintNFT(currentTrack.id, priceInWei)
            console.log("Minting successful:", receipt)
        } catch (error) {
            console.error("Error minting NFT:", error)
        } finally {
            setIsMinting(false)
            const nftAddress = currentTrack.id
            await addNftToUser(nftAddress)
            console.log("Saved to the database")
        }
    }

    function handleArtistNav() {
        dialogRef.current.close()
        navigate(`/${currentTrack.artist}`)
    }

    function handleCopy() {
        navigator.clipboard.writeText(currentTrack.id)
    }

    return (
        <>
            {isOpen && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" />
            )}
            <dialog
                ref={dialogRef}
                className="bg-base-100 text-base-content w-[500px] p-4 rounded-2xl shadow-xl hide-scrollbar font-acidNormal"
            >
                <div className="flex flex-col max-h-[100vh]">
                    <div className="relative pt-[100%]">
                        <img
                            src={currentTrack.imageUrl}
                            alt={currentTrack.name}
                            className="absolute shadow-lg rounded-lg top-0 left-0 aspect-square object-cover"
                        />
                        <div className="absolute rounded-lg inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div
                            variant="secondary"
                            className="absolute badge badge-accent top-4 right-4  backdrop-blur-sm border-0"
                        >
                            {genre}
                        </div>
                    </div>

                    <div className="p-4 space-y-5">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-acidBold">
                                {currentTrack.name}
                            </h3>
                            <p
                                className="cursor-pointer w-fit hover:text-gray-400 transition-colors"
                                onClick={handleArtistNav}
                            >
                                {currentTrack.artist}
                            </p>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg bg-base-300 border border-base-content">
                            <div className="space-y-2">
                                <p className="text-xl font-acidBold">
                                    Current Price
                                </p>
                                <div className="flex gap-5 items-center">
                                    <p className="text-lg font-acidMedium">
                                        {priceFormat} ETH
                                    </p>
                                    <p className="text-md">
                                        (${priceInUSD} USD)
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xl font-acidBold">
                                    Contract Address
                                </p>
                                <div className="flex items-center justify-between bg-neutral p-3 rounded-lg text-neutral-content">
                                    <p className="text-sm font-mono truncate">
                                        {currentTrack.id}
                                    </p>
                                    <Copy
                                        className="cursor-pointer hover:text-gray-400 transition-colors"
                                        onClick={handleCopy}
                                        size={16}
                                    />
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
                                className="flex-1 bg-error text-base-100 py-3 px-4 rounded-lg font-acidMedium hover:bg-error hover:bg-opacity-90 transition-colors"
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
