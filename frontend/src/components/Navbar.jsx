import { Search } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useUser } from "../contexts/UserProvider"
import ConnectButton from "./ui/ConnectButton"
import logo from "../assets/logo.png"
import Logo from "./Logo"

function Navbar() {
    const [searchResults, setSearchResults] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [showResults, setShowResults] = useState(false)
    const { searchUsers } = useUser()
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    async function handleSearch(e) {
        e.preventDefault()
        setShowResults(false)
        setSearchResults([])

        if (searchQuery.trim() === "") {
            return
        }

        try {
            const results = await searchUsers(searchQuery)
            setSearchResults(results)
            setShowResults(results.length > 0)
        } catch (error) {
            console.error("Error searching users:", error)
        }
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowResults(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="fixed top-0 right-0 left-0 h-20 flex justify-end items-center px-8 z-50">
            <Logo />
            <form
                className="bg-zinc-100 rounded-3xl p-1 px-2 flex items-center w-2/5 max-w-3xl mx-auto"
                onSubmit={handleSearch}
            >
                <Search size={24} strokeWidth={2} />
                <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent flex-grow h-10 px-4 pb-0.5 text-lg outline-none placeholder-secondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
            {showResults && searchResults.length > 0 && (
                <div
                    className="absolute max-w-3xl top-4/5 w-4/5 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md z-1001 max-h-72 overflow-y-auto"
                    ref={dropdownRef}
                >
                    {searchResults.map((user) => (
                        <div
                            key={user.walletAddress}
                            className="flex items-center p-2.5 cursor-pointer"
                            onClick={() => navigate(`/${user.name}`)}
                        >
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-10 h-10 rounded-full mr-2.5 object-cover"
                            />
                            <span>{user.name}</span>
                        </div>
                    ))}
                </div>
            )}
            <ConnectButton />
        </div>
    )
}

export default Navbar
