import { useEffect, useState } from "react"

import HeroSection from "../components/pages/LandingPage/HeroSection"
import DisplayNfts from "../components/pages/LandingPage/DisplayNfts"
import FeaturesSection from "../components/pages/LandingPage/FeaturesSection"
import HowItWorks from "../components/pages/LandingPage/HowItWorks"
import Footer from "../components/pages/LandingPage/Footer"

function LandingPage() {
    const [landingPageNfts, setLandingPageNfts] = useState([])
    const [addresses, setAddresses] = useState([])
    useEffect(() => {
        async function fetchLandingPageNfts() {
            const url = import.meta.env.VITE_SERVER_URL
            const res = await fetch(`${url}/nft/landingPageNfts`)
            const data = await res.json()
            setLandingPageNfts(data.nftMetadata)
            setAddresses(data.nftDetails.map((nft) => nft.address))
        }
        fetchLandingPageNfts()
    }, [])

    return (
        <div className="relative">
            <div
                className="absolute top-[5vh] right-[-20%] w-[70%] h-[90vh] opacity-50
                           bg-gradient-radial from-emerald-500 via-teal-600 to-transparent
                           rounded-full blur-[100px] pointer-events-none z-0"
            ></div>
            <HeroSection />
            <div
                className="absolute top-[200vh] left-[0%] w-[30%] h-[40vh] opacity-50
                           bg-gradient-radial from-emerald-200 via-teal-700 to-transparent
                           rounded-full blur-[100px] pointer-events-none z-0"
            ></div>
            <DisplayNfts nfts={landingPageNfts} addresses={addresses} />
            <FeaturesSection />
            <HowItWorks />
            <Footer />
        </div>
    )
}

export default LandingPage
