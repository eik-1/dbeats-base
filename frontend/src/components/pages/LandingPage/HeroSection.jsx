import React from "react"

import Navbar from "./Navbar"
import musicnote from "../../../assets/music.png"

function HeroSection() {
    const navbarHeightPadding = "pt-24 md:pt-48"
    // const videoUrl =
    //     "https://res.cloudinary.com/doac8yyie/video/upload/f_auto:video,q_auto/musicnote_myp7yb"

    return (
        <div className="min-h-[100vh] text-white relative p-8 md:p-32 md:pt-8 overflow-hidden">
            <Navbar />

            <header
                className={`relative z-10 ${navbarHeightPadding} max-w-3xl`}
            >
                <h1 className="text-5xl md:text-[5.5rem] font-bold mb-4">
                    Listen Freely.
                    <br />
                    Own the Music.
                </h1>
                <p className="text-md mt-5 ml-1 md:text-2xl mb-8 text-gray-400">
                    Powered by Web3. Controlled by Listeners.
                </p>
            </header>

            <div
                className="absolute top-1/2 right-[10%] transform -translate-y-1/2 z-0
                            w-1/2 md:w-1/3 
                            opacity-70 pointer-events-none
                            hidden lg:block"
            >
                <img
                    src={musicnote}
                    alt="Hero Section Video"
                    className="w-full h-auto object-cover"
                />
            </div>

            <footer className="absolute bottom-10 left-8 right-8 md:left-12 md:right-12 flex justify-between items-center z-10">
                <p className="text-sm text-gray-400 max-w-xs"></p>
            </footer>
        </div>
    )
}

export default HeroSection
