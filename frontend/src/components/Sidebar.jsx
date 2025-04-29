import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import { Compass, Home, Music, Plus, User } from "lucide-react"
import React from "react"
import { Link, useNavigate } from "react-router-dom"

import { useUser } from "../contexts/UserProvider"
import Button from "./ui/Button.jsx"

function Sidebar() {
    const { isConnected } = useWeb3ModalAccount()
    const navigate = useNavigate()
    const { user } = useUser()

    function handleCreateNFT() {
        navigate("/app/create")
    }

    return (
        <div className="w-64 h-[calc(100vh-200px)] fixed ml-4 p-4 shadow-md bg-zinc-900 rounded-md">
            <nav className="mt-10 font-bold text-lg text-zinc-50">
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
                <Button onClick={handleCreateNFT}>
                    <Plus size={23} strokeWidth={3} /> Create NFT
                </Button>
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
