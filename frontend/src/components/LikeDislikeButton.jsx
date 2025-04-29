import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import axios from "axios"
import { Heart } from "lucide-react"
import React, { useEffect, useState } from "react"

import NotConnected from "./NotConnected"

const LikeDislikeButton = ({ nftAddress, userAddress }) => {
    const [hasLiked, setHasLiked] = useState(false)
    const [heartFill, setHeartFill] = useState(hasLiked)
    const [isMintModalOpen, setIsMintModalOpen] = useState(false)
    const { isConnected } = useWeb3ModalAccount()

    const serverUrl = import.meta.env.VITE_SERVER_URL

    useEffect(() => {
        setHeartFill(hasLiked)
    }, [hasLiked])

    useEffect(() => {
        async function fetchLikeStatus() {
            const response = await axios.post(`${serverUrl}/nft/isLiked`, {
                nftAddress,
                userAddress,
            })
            setHasLiked(response.data.hasLiked)
        }
        fetchLikeStatus()
    }, [nftAddress, userAddress])

    function handleMintClick() {
        setIsMintModalOpen(true)
    }

    function handleCloseMintModal() {
        setIsMintModalOpen(false)
    }

    const handleLikeDislike = async () => {
        if (!isConnected) {
            handleMintClick()
        } else {
            setHeartFill((prev) => !prev)
            try {
                await axios.post(`${serverUrl}/nft/likeDislikeMusic`, {
                    nftAddress,
                    userAddress,
                })
            } catch (error) {
                console.error(
                    "Error updating like count:",
                    error.response?.data || error,
                )
            }
        }
    }

    return (
        <>
            <div onClick={handleLikeDislike} className="ml-10 cursor-pointer">
                {heartFill ? (
                    <Heart
                        absoluteStrokeWidth={0}
                        fill="oklch(69.6% 0.17 162.48)"
                        className="text-accent"
                    />
                ) : (
                    <Heart />
                )}
            </div>
            <NotConnected
                isOpen={isMintModalOpen}
                onClose={handleCloseMintModal}
            />
        </>
    )
}

export default LikeDislikeButton
