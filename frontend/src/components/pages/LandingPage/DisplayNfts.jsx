import GlassNftCard from "./GlassNftCard"

export default function DisplayNfts({ nfts, addresses }) {
    return (
        <section className="min-h-[100vh] py-16 md:pt-10 md:py-24 text-white">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-7xl font-semibold tracking-tight mb-3">
                        Top Tracks This Week
                    </h2>
                    <p className="text-lg mt-4 md:text-xl text-gray-400 max-w-3xl mx-auto">
                        Discover curated digital collectibles from emerging and
                        established artists.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    {nfts.length > 0 ? (
                        nfts.map((nft, index) => (
                            <GlassNftCard
                                key={index}
                                nft={nft}
                                address={addresses[index]}
                            />
                        ))
                    ) : (
                        <>
                            {[...Array(4)].map((_, index) => (
                                <div
                                    key={index}
                                    className="w-[220px] h-[320px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 animate-pulse"
                                >
                                    <div className="w-full h-[180px] bg-gray-700/50 rounded-lg mb-3"></div>
                                    <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
