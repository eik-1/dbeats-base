import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { useUser } from "../contexts/UserProvider"
import ProfileSongsListItem from "../components/ProfileSongsListItem"

function UsersProfile() {
    const { searchUsers } = useUser()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [nftData, setNftData] = useState(null)
    const [queryStatus, setQueryStatus] = useState("idle")
    const [queryError, setQueryError] = useState(null)

    const { name } = useParams()
    const serverUrl = import.meta.env.VITE_SERVER_URL

    useEffect(() => {
        if (user && user.walletAddress && user.isArtist) {
            setQueryStatus("pending")
            fetch(`${serverUrl}/userNfts?walletAddress=${user.walletAddress}`)
                .then((response) => response.json())
                .then((result) => {
                    setNftData(result)
                    setQueryStatus("success")
                })
                .catch((err) => {
                    console.error("Error fetching data:", err)
                    setQueryError(err)
                    setQueryStatus("error")
                })
        }
    }, [user])

    useEffect(() => {
        async function initializeUser() {
            setLoading(true)
            const newUser = await searchUsers(name)
            setUser(newUser[0])
            setLoading(false)
        }
        initializeUser()
    }, [name, searchUsers])

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>User not found</div>
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
                        {user.walletAddress}
                    </p>
                </div>
                <div className="text-[#F5F5F5] flex justify-end">
                    <button className="bg-[#3CB4AC] border-none px-6 py-3 rounded cursor-pointer text-base transition-colors duration-300 ease-in-out mr-8 hover:bg-[#2A7D77]">
                        Follow
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
                {queryStatus === "pending" && (
                    <div className="text-center text-xl text-[#424242] mt-8 font-['Acid_Grotesk_Medium']">
                        Loading...
                    </div>
                )}
                {queryStatus === "error" && (
                    <div className="text-center text-xl text-[#424242] mt-8 font-['Acid_Grotesk_Medium']">
                        Error occurred querying the server: {queryError.message}
                    </div>
                )}
                {queryStatus === "success" && (
                    <div className="mt-5 w-full flex flex-col gap-4 items-center">
                        {nftData.artist ? (
                            nftData.artist.nfts.map((nft) => (
                                <Link
                                    to={`/track/${nft.address}`}
                                    state={{ address: nft.address }}
                                    key={nft.address}
                                    className="mt-5 w-full flex flex-col gap-4 items-center"
                                >
                                    <ProfileSongsListItem
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

export default UsersProfile
