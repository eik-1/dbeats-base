import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"

const UserContext = createContext()

function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const { address, isConnected } = useWeb3ModalAccount()

    const serverUrl = import.meta.env.VITE_SERVER_URL

    useEffect(() => {
        async function fetch() {
            if (isConnected && address) {
                await fetchUser(address)
            } else {
                setUser(null)
            }
        }
        fetch()
    }, [address, isConnected])

    async function fetchUser(walletAddress) {
        if (isConnected && address) {
            try {
                setLoading(true)
                const response = await axios.get(
                    `${serverUrl}/user/${walletAddress}`,
                )
                setUser(response.data)
                console.log("User fetched:", user)
                return response.data
            } catch (error) {
                console.error("Error fetching user:", error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
    }

    async function searchUsers(name) {
        try {
            const response = await axios.get(`${serverUrl}/user/search/${name}`)
            return response.data
        } catch (error) {
            console.error("Error searching users:", error)
        }
    }

    async function createUser(userData) {
        try {
            const response = await axios.post(
                `${serverUrl}/user/create`,
                userData,
            )
            console.log(response.data)
            setUser(response.data)
        } catch (error) {
            console.error("Error creating user:", error)
        }
    }

    async function updateUser(userData) {
        try {
            const response = await axios.put(
                `${serverUrl}/user/${userData.walletAddress}`,
                userData,
            )
            setUser(response.data)
        } catch (error) {
            console.error("Error updating user:", error)
        }
    }

    async function addNftToUser(nftAddress) {
        try {
            const response = await axios.post(`${serverUrl}/user/addNft`, {
                walletAddress: address,
                nftAddress,
            })
            setUser(response.data)
        } catch (error) {
            console.error("Error updating user:", error)
        }
    }

    async function applyForArtist() {
        try {
            const response = await axios.put(
                `${serverUrl}/user/${user.walletAddress}`,
                { ...user, hasApplied: true },
            )
            setUser(response.data)
        } catch (error) {
            console.error("Error applying for artist:", error)
        }
    }

    // function connectTwitter(twitterUsername) {
    //     dispatch({ type: "CONNECT_TWITTER", payload: twitterUsername })
    // }

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                updateUser,
                addNftToUser,
                createUser,
                fetchUser,
                searchUsers,
                applyForArtist,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

function useUser() {
    const context = useContext(UserContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}

export { UserProvider, useUser }
