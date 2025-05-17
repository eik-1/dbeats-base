import React from "react"
import { Link } from "react-router-dom"

const GlassNftCard = ({ nft, address }) => {
    if (!nft) {
        return (
            <div className="w-[220px] h-[320px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex justify-center items-center text-white/70 animate-pulse">
                Loading...
            </div>
        )
    }

    const getDisplayImageUrl = (nftData) => {
        let uri = nftData.image || ""
        const pinataGateway = import.meta.env.VITE_PINATA_GATEWAY_URL
        if (uri && !uri.startsWith("https://")) {
            uri = uri.replace("ipfs://", "")
            uri = `https://${pinataGateway}/ipfs/${uri}`
        }
        return uri
    }

    const imageUrl = getDisplayImageUrl(nft)

    return (
        <Link to={`/app/track/${address}`}>
            <div className="group w-[220px] h-[320px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-4 text-white flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:border-white/30 overflow-hidden">
                <div className="relative w-full h-[180px] mb-3">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={nft.name || "NFT Image"}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center bg-black/30 text-white/50 text-sm">
                            No Image Available
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-opacity transition-transform duration-300 rounded-lg flex items-center justify-center"></div>
                </div>

                <div className="flex flex-col flex-grow overflow-hidden">
                    <h3
                        className="text-base font-semibold mb-1 truncate"
                        title={nft.name || "Unknown Title"}
                    >
                        {nft.name || "Unknown Title"}
                    </h3>
                    <p
                        className="text-sm text-white/70 mb-0 truncate"
                        title={nft.creator}
                    >
                        {nft.creator}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default GlassNftCard
