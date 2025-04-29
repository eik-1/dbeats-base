import React, { useEffect, useState } from "react"

function ProfileCard({ id, uri, mintprice, address }) {
    const [name, setName] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [artist, setArtist] = useState("")
    const [numberOfOwners, setNumberOfOwners] = useState(0)

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/nftData?uri=${encodeURIComponent(uri)}&address=${address}`,
                )
                const data = await response.json()
                setName(data.name)
                setImageUrl(data.image)
                setArtist(data.artist)
                setNumberOfOwners(data.numberOfOwners)
            } catch (error) {
                console.error("Error fetching NFT data:", error)
            }
        }

        fetchNftData()
    }, [uri, address])

    // if (loading) {
    //     return <Skeleton className="h-[125px] w-[250px] rounded-xl" />
    // }

    return (
        <div className="bg-[#ececec] rounded-[10px] w-full h-20 flex items-center p-2.5 mt-2.5">
            <img
                className="w-[60px] h-[60px] rounded-full object-cover"
                src={imageUrl}
                alt={name}
            ></img>
            <div className="flex justify-between w-full pl-[30px]">
                <div className="flex gap-[60px] items-center w-full">
                    <h1 className="flex-1 text-left text-lg font-semibold text-[#424242]">
                        {name}
                    </h1>
                    <p className="flex-1 text-left">
                        Mint Price : {mintprice / 10 ** 18} ETH
                    </p>
                    <p className="flex-1 text-left">
                        Copies Sold : {numberOfOwners}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileCard
