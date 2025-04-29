import { ethers } from "ethers"
import { useState, useEffect } from "react"

import { factoryContractAddress, factoryABI } from "../Utils/Config"
import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import { useUser } from "../contexts/UserProvider"

function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [artistAddress, setArtistAddress] = useState("")
    const [inputValue, setInputValue] = useState("")
    const { address, isConnected } = useWeb3ModalAccount()

    const { updateUser } = useUser()

    useEffect(() => {
        let isMounted = true

        async function checkAdminStatus() {
            console.log("Checking admin status for address:", address)
            if (isConnected && address) {
                try {
                    const provider = new ethers.JsonRpcProvider(
                        import.meta.env.VITE_ARB_SEPOLIA_RPC,
                    )
                    const factoryContractInstance = new ethers.Contract(
                        factoryContractAddress,
                        factoryABI,
                        provider,
                    )
                    const adminRole = await factoryContractInstance.ADMIN_ROLE()
                    const hasRole = await factoryContractInstance.hasRole(
                        adminRole,
                        address,
                    )
                    console.log("Has admin role:", hasRole)
                    if (isMounted) {
                        setIsAdmin(hasRole)
                    }
                } catch (error) {
                    console.error("Error checking admin status:", error)
                    if (isMounted) {
                        setIsAdmin(false)
                    }
                }
            } else {
                console.log("Not connected or no address")
                if (isMounted) {
                    setIsAdmin(false)
                }
            }
        }

        checkAdminStatus()

        return () => {
            isMounted = false
        }
    }, [isConnected, address])

    useEffect(() => {
        console.log("isAdmin updated:", isAdmin)
    }, [isAdmin])

    async function addArtist(address) {
        if (!window.ethereum) {
            console.error("MetaMask is not installed!")
            return
        }

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            await browserProvider.send("eth_requestAccounts", [])
            const signer = await browserProvider.getSigner()
            const factoryContractInstanceWithSigner = new ethers.Contract(
                factoryContractAddress,
                factoryABI,
                signer,
            )

            const tx =
                await factoryContractInstanceWithSigner.addArtist(address)
            await tx.wait()
            console.log(tx)
            console.log("Artist added to factory")
            await updateUser({ walletAddress: address, isArtist: true })
        } catch (error) {
            console.error("Error adding artist:", error)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setArtistAddress(inputValue)
        console.log("Artist Address updated to:", inputValue)
        addArtist(inputValue)
        setInputValue("")
        //add artist address to factory as an artist
    }

    return (
        <div className="mt-[200px] ml-[200px]">
            {isAdmin ? (
                <>
                    <h1 className="text-3xl">Admin</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >
                        <label>
                            <p>New Artist Wallet Address</p>
                            <input
                                className="w-[400px] h-[30px] border-2 border-black"
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </label>
                        <input
                            className="w-[100px] h-[30px] border-2 border-black cursor-pointer"
                            type="submit"
                            value="Submit"
                        />
                    </form>
                </>
            ) : (
                <h1>You do not have an Admin account!</h1>
            )}
        </div>
    )
}

export default AdminPage
