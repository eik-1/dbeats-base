import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import { Compass, Home, Music, Plus, User } from "lucide-react"
import React from "react"
import { Link, useNavigate } from "react-router-dom"

import { useUser } from "../contexts/UserProvider"

function Sidebar() {
    const { isConnected } = useWeb3ModalAccount()
    const navigate = useNavigate()
    const { user } = useUser()

    function handleCreateNFT() {
        navigate("/app/create")
    }

    return (
        <div className="flex flex-col justify-start items-center w-64 h-[calc(100vh-200px)] fixed ml-4 p-4 shadow-md bg-zinc-900 rounded-md">
            <nav className="mt-10 self-start font-bold text-lg text-zinc-50">
                <SidebarItem
                    icon={<Home size={25} strokeWidth={2} />}
                    text="Home"
                    to="/app"
                />
                <SidebarItem
                    icon={<Compass size={25} strokeWidth={2} />}
                    text="Explore"
                    to="/app/market"
                />
                {isConnected && (
                    <>
                        <SidebarItem
                            icon={<Music size={25} strokeWidth={2} />}
                            text="My Music"
                            to="/my-music"
                        />
                        <SidebarItem
                            icon={<User size={25} strokeWidth={2} />}
                            text="Profile"
                            to="/app/profile"
                        />
                    </>
                )}
            </nav>
            {isConnected && user?.isArtist && (
                <button
                    className="mt-5 m-auto inline-flex items-center justify-center gap-2 whitespace-nowrap text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500 text-zinc-50 shadow hover:bg-primary/90 h-9 px-6 py-4 rounded-3xl"
                    onClick={handleCreateNFT}
                >
                    <Plus size={26} strokeWidth={4} /> Create NFT
                </button>
            )}
        </div>
    )
}

function SidebarItem({ icon, text, to }) {
    return (
        <Link
            to={to}
            className="flex items-center p-2 transition-all duration-100 hover:text-primary"
        >
            {icon}
            <span className="ml-4 transition-all duration-300 hover:ml-5">
                {text}
            </span>
        </Link>
    )
}

export default Sidebar
