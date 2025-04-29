import { Outlet } from "react-router-dom"

import MusicPlayer from "../components/MusicPlayer"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"

function AppLayout() {
    return (
        <>
            <Navbar />
            <div className="flex mt-24">
                <Sidebar />
                <div className="overflow-x-auto hide-scrollbar bg-zinc-900 rounded-md w-[calc(80vw+10px)] h-[calc(100vh-200px)] ml-72">
                    <Outlet />
                </div>
            </div>
            <MusicPlayer />
        </>
    )
}

export default AppLayout
