import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers/react"
import Avvvatars from "avvvatars-react"
import React, { useEffect, useState } from "react"

import { useUser } from "../../contexts/UserProvider"
import Button from "./Button"

export default function ConnectButton() {
    const { open } = useWeb3Modal()
    const { isConnected, address } = useWeb3ModalAccount()
    const { createUser, fetchUser } = useUser()

    useEffect(() => {
        async function initializeUser() {
            if (isConnected && address) {
                const user = await fetchUser(address)
                if (!user) {
                    const newUser = {
                        name: "User",
                        about: "",
                        profilePicture:
                            "https://indigo-neighbouring-smelt-221.mypinata.cloud/ipfs/QmSJVuP5U1G3Wm4b3dgJWV1rcK19pbdPtUkRvJPYe8MBQa",
                        walletAddress: address,
                        isArtist: false,
                        twitterUsername: "",
                    }
                    await createUser(newUser)
                }
            }
        }
        initializeUser()
    }, [isConnected, address])

    const handleClick = () => {
        if (isConnected) {
            open()
        } else {
            open()
        }
    }

    return (
        <div
            className="mr-5 rounded-xl flex justify-center items-center"
            onClick={handleClick}
        >
            {isConnected ? (
                <div className="relative inline-block">
                    <div className="cursor-pointer overflow-hidden">
                        <Avvvatars
                            style="shape"
                            value={address}
                            size={40}
                            shadow={true}
                            border={true}
                            borderColor="oklch(76.5% 0.177 163.223)"
                        />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-base-100"></span>
                </div>
            ) : (
                <Button>Connect</Button>
            )}
        </div>
    )
}
