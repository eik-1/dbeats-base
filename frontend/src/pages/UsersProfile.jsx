import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import { useUser } from "../contexts/UserProvider"
import ProfileSongsListItem from "../components/ProfileSongsListItem"
import { Spinner } from "../components/ui/Spinner"
import getNFTDetails from "../Utils/services/getNFTDetails"
import getArtistNfts from "../Utils/services/getArtistNfts"

function UsersProfile() {
    const location = useLocation()
    const username = location.pathname.substring(5)

    const { searchUsers } = useUser()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [nfts, setNfts] = useState([])
    const [nftDetailsLoading, setNftDetailsLoading] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            setLoading(true)
            try {
                const newUser = await searchUsers(username)
                setUser(newUser)
                if (newUser && newUser.walletAddress && newUser.isArtist) {
                    setNftDetailsLoading(true)
                    const nftsFetched = await getArtistNfts(
                        newUser.walletAddress.toLowerCase(),
                    )
                    const nfts = nftsFetched.artist.nfts
                    setNfts(nfts)
                } else {
                    setNfts([])
                }
                setNftDetailsLoading(false)
            } catch (err) {
                console.error("Error fetching user:", err)
                setUser(null)
                setNfts([])
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [username, searchUsers])

    if (loading) {
        return (
            <div className="text-center text-xl text-zinc-50 flex items-center justify-center h-full">
                <Spinner />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center text-xl text-zinc-50 flex items-center justify-center h-full">
                User Not Found
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
                    <p className="text-base text-zinc-100">
                        {user.walletAddress}
                    </p>
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

            {user?.isArtist && (
                <>
                    <h1 className="text-3xl text-zinc-50 mt-5 mb-2.5">
                        Popular Tracks
                    </h1>
                    <div>
                        {nftDetailsLoading ? (
                            <div className="text-center text-xl text-zinc-50 mt-8">
                                <Spinner />
                            </div>
                        ) : nfts.length > 0 ? (
                            <div className="w-full flex flex-col gap-1 items-start justify-start">
                                {nfts.map((nft, index) => (
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
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-xl text-zinc-50 mt-8">
                                No NFTs found
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default UsersProfile
