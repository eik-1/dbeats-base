import { useQuery } from "@tanstack/react-query"
import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import ProfileCard from "../components/ProfileCard"
import { useUser } from "../contexts/UserProvider"

function Profile() {
    const { address, isConnected } = useWeb3ModalAccount()
    const { user, fetchUser, applyForArtist } = useUser()
    const navigate = useNavigate()
    const serverUrl = import.meta.env.VITE_SERVER_URL
    let newAddress

    if (address) {
        newAddress = address.toLowerCase()
    }

    const { data, status, error } = useQuery({
        queryKey: ["nfts", newAddress],
        queryFn: async () => {
            if (newAddress) {
                console.log("Fetching data for artistId:", newAddress)
                try {
                    const response = await fetch(
                        `${serverUrl}/userNfts?walletAddress=${newAddress}`,
                    )
                    const result = await response.json()
                    console.log("Response from server:", result)
                    return result
                } catch (err) {
                    console.error("Error fetching data:", err)
                    throw err
                }
            }
        },
        enabled: !!newAddress,
    })

    useEffect(() => {
        async function initializeUser() {
            if (address) {
                const newUser = await fetchUser(address)
                console.log("Fetched user:", newUser)
            }
        }
        initializeUser()
    }, [isConnected, address])

    async function handleApply() {
        await applyForArtist()
        window.location.reload()
    }

    if (!isConnected || !user) {
        return (
            <div className="text-center text-xl text-[#424242] mt-8 font-['Acid_Grotesk_Medium']">
                Please connect your wallet to view your profile.
            </div>
        )
    }

    return (
        <div className="p-8 box-border">
            <div className="flex items-center justify-between mb-8">
                <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-[150px] h-[150px] rounded-[10%] object-cover"
                />
                <div className="flex-grow ml-8">
                    <h1 className="text-4xl mb-2 font-['Acid_Grotesk_Bold'] text-[#424242]">
                        {user.name}
                    </h1>
                    <p className="text-base text-[#666] font-['Acid_Grotesk_Regular']">
                        {address}
                    </p>
                </div>
                <div className="text-[#F5F5F5] flex gap-4">
                    {!user.hasApplied ? (
                        <button
                            onClick={handleApply}
                            className="bg-[#424242] border-none px-6 py-3 rounded cursor-pointer text-base transition-colors duration-300 ease-in-out hover:bg-[#333333]"
                        >
                            Apply For Artist
                        </button>
                    ) : user.isArtist ? (
                        <></>
                    ) : (
                        <button
                            disabled
                            className="bg-[#BDBDBD] border-none px-6 py-3 rounded cursor-pointer text-base"
                        >
                            Applied
                        </button>
                    )}

                    <button
                        onClick={() => navigate("/profile/edit")}
                        className="bg-[#3CB4AC] border-none px-6 py-3 rounded cursor-pointer text-base transition-colors duration-300 ease-in-out hover:bg-[#2A7D77]"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md">
                <h2 className="text-2xl mb-4 font-['Acid_Grotesk_Bold'] text-[#424242]">
                    About
                </h2>
                <p className="text-[#424242] leading-relaxed">{user.about}</p>
            </div>
            <h1 className="text-3xl font-['Acid_Grotesk_Bold'] text-[#424242] mt-5 mb-2.5">
                Tracks Created
            </h1>
            <div>
                {status === "pending" && (
                    <div className="text-center text-xl text-[#424242] mt-8 font-['Acid_Grotesk_Medium']">
                        Loading...
                    </div>
                )}
                {status === "error" && (
                    <div className="text-center text-xl text-[#424242] mt-8 font-['Acid_Grotesk_Medium']">
                        Error occurred querying the server: {error.message}
                    </div>
                )}
                {status === "success" && (
                    <div className="mt-5 w-full flex flex-col gap-4 items-center">
                        {data.artist ? (
                            data.artist.nfts.map((nft) => (
                                <Link
                                    to={`/track/${nft.address}`}
                                    state={{ address: nft.address }}
                                    key={nft.address}
                                    className="mt-5 w-full flex flex-col gap-4 items-center"
                                >
                                    <ProfileCard
                                        key={nft.tokenURI}
                                        uri={nft.tokenURI}
                                        mintprice={nft.mintPrice}
                                        address={nft.address}
                                    />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center text-xl text-[#424242] mt-8 font-['Acid_Grotesk_Medium']">
                                No artist data found for the given address.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
