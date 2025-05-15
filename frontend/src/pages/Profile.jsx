import { useQuery } from "@tanstack/react-query"
import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import React from "react"
import { Link, useNavigate } from "react-router-dom"

import ProfileSongsListItem from "../components/ProfileSongsListItem"
import Button from "../components/ui/Button"
import { useUser } from "../contexts/UserProvider"
import getArtistNfts from "../Utils/services/getArtistNfts"

function Profile() {
    const { address, isConnected } = useWeb3ModalAccount()
    const { user, applyForArtist } = useUser()
    const navigate = useNavigate()
    let newAddress

    if (address) {
        newAddress = address.toLowerCase()
    }

    const { data, status, error } = useQuery({
        queryKey: ["nfts", newAddress],
        queryFn: () => getArtistNfts(newAddress),
        enabled: !!newAddress,
    })

    async function handleApply() {
        await applyForArtist()
        window.location.reload()
    }

    if (!isConnected || !user) {
        console.log(address)
        return (
            <div className="text-center text-xl text-zinc-50 flex items-center justify-center h-full">
                Please connect your wallet to view your profile.
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="rounded-full w-36 h-36">
                    <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="object-cover w-36 h-36 rounded-full"
                    />
                </div>

                <div className="flex-grow ml-8">
                    <h1 className="text-5xl font-semibold mb-2 text-zinc-50">
                        {user.name}
                    </h1>
                    <p className="text-base text-zinc-100">{address}</p>
                </div>
                <div className="text-zinc-50 flex gap-4">
                    {!user.hasApplied ? (
                        <button
                            onClick={handleApply}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-zinc-100 text-zinc-900 shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-3xl"
                        >
                            Apply For Artist
                        </button>
                    ) : user.isArtist ? (
                        <></>
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-zinc-100 text-zinc-900 shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-3xl"
                        >
                            Applied
                        </button>
                    )}

                    <Button handleClick={() => navigate("/app/profile/edit")}>
                        Edit Profile
                    </Button>
                </div>
            </div>
            {user.about && (
                <div className="p-8">
                    <h2 className="text-2xl mb-4 text-zinc-50 font-semibold">
                        About
                    </h2>
                    <p className="text-zinc-50 leading-relaxed">{user.about}</p>
                </div>
            )}

            {user.isArtist && (
                <>
                    <h1 className="text-3xl text-zinc-50 mt-5 mb-2.5">
                        Popular Tracks
                    </h1>
                    <div>
                        {status === "pending" && (
                            <div className="text-center text-xl text-zinc-50 mt-8">
                                Loading...
                            </div>
                        )}
                        {status === "error" && (
                            <div className="text-center text-xl text-zinc-50 mt-8">
                                Error occurred querying the server:{" "}
                                {error.message}
                            </div>
                        )}
                        {status === "success" && (
                            <div className="w-full flex flex-col gap-1 items-start justify-start">
                                {data.artist ? (
                                    data.artist.nfts.map((nft, index) => (
                                        <Link
                                            to={`/app/track/${nft.address}`}
                                            state={{ address: nft.address }}
                                            key={nft.address}
                                            className="w-full flex flex-col gap-4"
                                        >
                                            <ProfileSongsListItem
                                                id={index + 1}
                                                uri={nft.tokenURI}
                                                mintprice={nft.mintPrice}
                                                address={nft.address}
                                            />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center text-xl text-zinc-50 mt-8">
                                        No artist data found for the given
                                        address.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Profile
