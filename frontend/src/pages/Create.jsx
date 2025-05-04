import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import { ethers } from "ethers"
import { ChevronDown, Music, Pen } from "lucide-react"
import { useEffect, useReducer, useRef } from "react"
import { useNavigate } from "react-router-dom"

import { useUser } from "../contexts/UserProvider"
import ipfsUpload from "../Utils/ipfsUpload"
import jsonUpload from "../Utils/jsonUpload"
import Mint from "../Utils/Mint"

const initialState = {
    musicImage: null,
    selectedImageFile: null,
    selectedTrack: null,
    releaseName: "",
    genre: "",
    mintPrice: "",
    isFormValid: false,
    isLoading: false,
    error: "",
    formError: "",
    info: "",
}

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD_VALUE":
            return { ...state, [action.field]: action.payload }
        case "SET_IS_FORM_VALID":
            return { ...state, isFormValid: action.payload }
        case "SET_LOADING":
            return { ...state, isLoading: action.payload }
        case "SET_ERROR":
            return { ...state, error: action.payload }
        case "SET_FORM_ERROR":
            return { ...state, formError: action.payload }
        default:
            return state
    }
}

const serverUrl = import.meta.env.VITE_SERVER_URL

function Label({ children, htmlFor }) {
    return (
        <label htmlFor={htmlFor} className="mb-2 text-2xl">
            {children}
        </label>
    )
}

export default function Create() {
    const { user } = useUser()
    const { address, isConnected } = useWeb3ModalAccount()
    const [state, dispatch] = useReducer(reducer, initialState)
    const navigate = useNavigate()

    // const [trackAddress, setTrackAddress] = useState("")

    const fileInputRef = useRef(null)
    const trackInputRef = useRef(null)

    // useEffect(() => {
    //     async function initializeUser() {
    //         if (address) {
    //             const newUser = await fetchUser(address)
    //             console.log("Fetched user:", newUser)
    //         }
    //     }
    //     initializeUser()
    // }, [isConnected, address])

    // useEffect to check if all the fields are filled
    // and set isFormValid to true
    // so that create button is enabled
    useEffect(() => {
        const isValid =
            state.musicImage &&
            state.releaseName.trim() !== "" &&
            state.genre !== "" &&
            state.mintPrice.trim() !== "" &&
            state.selectedTrack !== null

        dispatch({ type: "SET_IS_FORM_VALID", payload: isValid })
    }, [
        state.musicImage,
        state.releaseName,
        state.genre,
        state.mintPrice,
        state.selectedTrack,
        state.info,
    ])

    async function proceedMinting(_ipfsImageUrl, _ipfsTrackUrl) {
        if (_ipfsImageUrl && _ipfsTrackUrl) {
            try {
                const json = {
                    name: state.releaseName,
                    description: state.info,
                    image: _ipfsImageUrl,
                    animation_url: _ipfsTrackUrl,
                    creator: user.name,
                    attributes: [
                        { trait_type: "artist", value: user.name },
                        { trait_type: "genre", value: state.genre },
                    ],
                }
                const { cid } = await jsonUpload(json)
                const jsonURI = `ipfs://${cid}`

                const price = ethers.parseUnits(state.mintPrice, "ether")

                const eventLogs = await Mint({
                    user: address,
                    uri: jsonURI,
                    name: state.releaseName,
                    symbol: "DBNFT",
                    price: price,
                    genre: state.genre,
                })

                console.log(
                    "In Create.jsx - Minting successful with logs: ",
                    eventLogs,
                )
                const mintedNftAddress = eventLogs.nftAddress

                if (!mintedNftAddress) {
                    throw new Error("NFT address not found in event logs")
                }

                const musicNftDB = {
                    address: mintedNftAddress,
                    name: eventLogs.name,
                    genre: eventLogs.genre,
                }

                const response = await fetch(`${serverUrl}/nft/createNFT`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(musicNftDB),
                })

                if (!response.ok) {
                    throw new Error(
                        `Failed to create music nft: ${response.statusText}`,
                    )
                }

                console.log("NFT saved to database successfully")

                return mintedNftAddress
            } catch (error) {
                console.error("Minting error:", error)
                dispatch({
                    type: "SET_FORM_ERROR",
                    payload: error.message || "Failed to mint NFT",
                })
                dispatch({ type: "SET_LOADING", payload: false })
                return null
            }
        } else {
            dispatch({
                type: "SET_FORM_ERROR",
                payload: "Failed to upload files to IPFS",
            })
            dispatch({ type: "SET_LOADING", payload: false })
            return null
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // Check if all fields are filled
        if (!state.isFormValid) {
            dispatch({
                type: "SET_ERROR",
                payload: "Please fill all the fields",
            })
            return
        }

        dispatch({ type: "SET_LOADING", payload: true })

        try {
            dispatch({ type: "SET_FORM_ERROR", payload: "" })
            let imageUrl = ""
            let trackUrl = ""

            // Upload image and track to IPFS
            if (state.musicImage) {
                const { cid } = await ipfsUpload(state.selectedImageFile)
                imageUrl = `ipfs://${cid}`
            }

            if (state.selectedTrack) {
                const { cid } = await ipfsUpload(state.selectedTrack)
                trackUrl = `ipfs://${cid}`
            }

            // Proceed with minting
            const nftAddress = await proceedMinting(imageUrl, trackUrl)

            // On successful minting
            if (nftAddress) {
                console.log("Minting successful, NFT Address:", nftAddress)
                fileInputRef.current.value = ""
                trackInputRef.current.value = ""
                navigate(`/app/track/${nftAddress}`)
            }
            dispatch({ type: "SET_LOADING", payload: false })
        } catch (error) {
            dispatch({ type: "SET_FORM_ERROR", payload: error.message })
            dispatch({ type: "SET_LOADING", payload: false })
        }
    }

    function handleTrackChange(e) {
        const file = e.target.files[0]
        const maxSize = 20 * 1024 * 1024
        if (file && file.size > maxSize) {
            dispatch({ type: "SET_ERROR", payload: "File size exceeds 20MB." })
            e.target.value = null
            return
        }
        dispatch({
            type: "SET_FIELD_VALUE",
            field: "selectedTrack",
            payload: file,
        })
    }

    function handleImageChange(e) {
        const file = e.target.files[0]
        const maxSize = 2 * 1024 * 1024
        if (file && file.size > maxSize) {
            dispatch({ type: "SET_ERROR", payload: "File size exceeds 2MB." })
            e.target.value = null
            return
        }
        dispatch({
            type: "SET_FIELD_VALUE",
            field: "selectedImageFile",
            payload: file,
        })
        const reader = new FileReader()
        reader.onloadend = () => {
            dispatch({
                type: "SET_FIELD_VALUE",
                field: "musicImage",
                payload: reader.result,
            })
        }
        reader.readAsDataURL(file)
    }

    if (!isConnected || !user) {
        return (
            <div className="text-center text-xl text-zinc-50 flex items-center justify-center h-full">
                Please connect your wallet to view your profile.
            </div>
        )
    }

    if (!user?.isArtist) {
        return (
            <div className="p-8 box-border">
                <h1 className="text-xl text-center font-semibold text-zinc-50 mb-4 flex items-center justify-center h-full">
                    You are not an artist
                </h1>
            </div>
        )
    }

    return (
        <div className="p-8 box-border text-zinc-50">
            <h1 className="text-5xl font-semibold mb-4">Create Your Release</h1>
            <form method="POST" className="flex flex-col gap-7 p-8 mb-8">
                {/* Cover Image Upload Section */}
                <div className="flex flex-col w-fit gap-2">
                    <Label htmlFor="musicImage">1. Pick a cover image</Label>
                    <div
                        className="relative w-36 h-36 rounded-[10%] overflow-hidden cursor-pointer group"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <img
                            src={state.musicImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Pen className="text-emerald-500 w-[25px] h-[25px]" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        required
                    />
                    <p className="text-xs text-zinc-400 m-[0.3rem]">
                        {state.error ? state.error : "Max 2MB. (.jpg, .png)"}
                    </p>
                </div>

                {/* Release Name and Genre Selection */}
                <div className="flex gap-12 justify-between pr-60">
                    {/* Release Name Input */}
                    <div className="flex flex-col w-fit gap-2">
                        <Label htmlFor="musicName">
                            2. What's the release called?
                        </Label>
                        <input
                            type="text"
                            id="releaseName"
                            name="releaseName"
                            placeholder="Release Name"
                            value={state.releaseName}
                            className="flex h-9 w-full rounded-md border border-input bg-zinc-50 px-3 py-1 text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring "
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "releaseName",
                                    payload: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    {/* Genre Selection */}
                    <div className="flex flex-col w-fit gap-2">
                        <Label htmlFor="musicGenre">3. Select a genre</Label>
                        <div className="relative w-full">
                            <select
                                id="musicGenre"
                                name="musicGenre"
                                className="appearance-none flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-400 bg-zinc-50 px-3 py-1 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 pr-8"
                                value={state.genre}
                                onChange={(e) =>
                                    dispatch({
                                        type: "SET_FIELD_VALUE",
                                        field: "genre",
                                        payload: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="" disabled hidden>
                                    Genre
                                </option>
                                <option value="Hip-Hop">Hip Hop</option>
                                <option value="Rap">Rap</option>
                                <option value="Rock">Rock</option>
                                <option value="Pop">Pop</option>
                                <option value="Electronic">Electronic</option>
                                <option value="Country">Country</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none text-zinc-900" />
                        </div>
                    </div>
                </div>

                {/* Mint Price Input */}
                <div className="flex flex-col w-fit gap-2">
                    <label
                        htmlFor="musicFile"
                        className="mb-2 text-2xl  text-zinc-50"
                    >
                        4. Mint Price
                    </label>
                    <div className="flex items-center justify-center text-zinc-900 bg-zinc-50 rounded-md border-0 gap-2 h-9 pr-2">
                        <input
                            type="number"
                            id="mintPrice"
                            name="mintPrice"
                            placeholder="Mint Price"
                            className="px-3 py-1 rounded-md h-9 focus:outline-none bg-zinc-50 text-zinc-900 placeholder-zinc-400"
                            value={state.mintPrice}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "mintPrice",
                                    payload: e.target.value,
                                })
                            }
                            required
                        />
                        <span className="text-zinc-900 font-medium">ETH</span>
                    </div>
                </div>

                {/* Music Track Upload Section */}
                <div className="flex flex-col w-fit gap-2">
                    <Label htmlFor="musicTrack">
                        5. Select your music track
                    </Label>
                    <div
                        className="w-full h-[100px] border-2 border-dashed border-[#ccc] rounded-lg flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out hover:border-emerald-500 hover:bg-emerald-500/5"
                        onClick={() => trackInputRef.current.click()}
                    >
                        {state.selectedTrack ? (
                            <p className="text-zinc-50 break-all text-center px-4">
                                {state.selectedTrack.name}
                            </p>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Music className="w-8 h-8 mb-2" />
                                <p className="text-xs text-zinc-50 m-[0.3rem]">
                                    Click to select a track
                                </p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={trackInputRef}
                        onChange={handleTrackChange}
                        accept="audio/*"
                        className="hidden"
                        required
                    />
                    <p className="text-xs zinc-400 m-[0.3rem]">
                        Max 20MB. (.mp3, .wav)
                    </p>
                </div>

                {/* track info /description  Input */}
                <div className="flex flex-col w-fit gap-2">
                    <label
                        htmlFor="info"
                        className="mb-2 text-2xl text-zinc-50"
                    >
                        6. Track Info
                    </label>
                    <div className="flex w-[1000px] gap-12 justify-between pr-60">
                        <textarea
                            type="text"
                            id="info"
                            name="info"
                            placeholder="Track Description"
                            className="w-full min-h-[150px] px-3 py-3 rounded-md resize-y text-zinc-900 focus:outline-none placeholder:text-zinc-400 bg-zinc-50"
                            value={state.info}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "info",
                                    payload: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                {state.formError && (
                    <span className="text-red-500 text-base font-medium">
                        {state.formError}
                    </span>
                )}
                {!state.formError && (
                    <button
                        type="submit"
                        className="w-fit inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500 text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-3xl"
                        onClick={handleSubmit}
                        disabled={state.isLoading || !state.isFormValid}
                    >
                        {state.isLoading ? "Minting..." : "Create"}
                    </button>
                )}
            </form>
        </div>
    )
}
