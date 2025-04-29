import { useWeb3ModalAccount } from "@web3modal/ethers/react"
import { ethers } from "ethers"
import { Music, Pen } from "lucide-react"
import { useEffect, useReducer, useRef, useState } from "react"
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
    ipfsImageUrl: "",
    ipfsTrackUrl: "",
    platformIfpsImageUrl: "",
    platformIpfsTrackUrl: "",
    jsonUrl: "",
    isFormValid: false,
    isLoading: false,
    error: "",
    formError: "",
    info: "",
    mintedNftAddress: null,
    mintingSuccess: false,
}

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD_VALUE":
            return { ...state, [action.field]: action.value }
        case "SET_IS_FORM_VALID":
            return { ...state, isFormValid: action.isValid }
        case "SET_LOADING":
            return { ...state, isLoading: action.isLoading }
        case "SET_ERROR":
            return { ...state, error: action.error }
        case "SET_FORM_ERROR":
            return { ...state, formError: action.formError }
        case "MINTING_SUCCESS":
            return {
                ...state,
                mintingSuccess: true,
                mintedNftAddress: action.nftAddress,
                isLoading: false,
            }
        case "RESET_FORM":
            return { ...initialState }
        default:
            return state
    }
}

const serverUrl = import.meta.env.VITE_SERVER_URL

const Create = () => {
    const { user } = useUser()
    const { address } = useWeb3ModalAccount()
    const navigate = useNavigate()
    const [state, dispatch] = useReducer(reducer, initialState)

    // const [trackAddress, setTrackAddress] = useState("")

    const fileInputRef = useRef(null)
    const trackInputRef = useRef(null)

    useEffect(() => {
        const isValid =
            state.musicImage &&
            state.releaseName.trim() !== "" &&
            state.genre !== "" &&
            state.mintPrice.trim() !== "" &&
            state.selectedTrack !== null

        dispatch({ type: "SET_IS_FORM_VALID", isValid })
    }, [
        state.musicImage,
        state.releaseName,
        state.genre,
        state.mintPrice,
        state.selectedTrack,
        state.info,
    ])

    useEffect(() => {
        if (state.ipfsImageUrl && state.ipfsTrackUrl) {
            const proceedWithMinting = async () => {
                try {
                    const json = {
                        name: state.releaseName,
                        description: state.info,
                        image: state.ipfsImageUrl,
                        imageUrl: state.platformIfpsImageUrl,
                        animation_url: state.ipfsTrackUrl,
                        animationUrl: state.platformIpfsTrackUrl,
                        attributes: [
                            { trait_type: "artist", value: user.name },
                            { trait_type: "genre", value: state.genre },
                        ],
                    }

                    const jsonReciept = await jsonUpload(json)
                    dispatch({
                        type: "SET_FIELD_VALUE",
                        field: "jsonUrl",
                        value: jsonReciept,
                    })

                    const price = ethers.parseUnits(state.mintPrice, "ether")
                    const eventLogs = await Mint({
                        user: address,
                        uri: jsonReciept,
                        name: state.releaseName,
                        symbol: "DBNFT",
                        price: price,
                        genre: state.genre,
                    })

                    console.log(
                        "In Create.jsx - Minting successful with logs: ",
                        eventLogs,
                    )
                    const mintedNftAddress = eventLogs.nftAddress.toLowerCase()

                    if (!mintedNftAddress) {
                        throw new Error("NFT address not found in event logs")
                    }

                    const musicNftDB = {
                        address: mintedNftAddress,
                        name: eventLogs.name,
                        genre: eventLogs.genre,
                    }

                    dispatch({ type: "SET_LOADING", isLoading: false })

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
                    console.log("mintedNftAddress:", mintedNftAddress)

                    dispatch({
                        type: "MINTING_SUCCESS",
                        nftAddress: mintedNftAddress,
                    })
                } catch (error) {
                    console.error("Minting error:", error)
                    dispatch({
                        type: "SET_FORM_ERROR",
                        formError: error.message || "Failed to mint NFT",
                    })
                    dispatch({ type: "SET_LOADING", isLoading: false })
                }
            }

            proceedWithMinting()
        }
    }, [state.ipfsImageUrl, state.ipfsTrackUrl, user.name, address])

    useEffect(() => {
        if (state.mintingSuccess && state.mintedNftAddress) {
            console.log(
                "Minting success detected, navigating to:",
                `/track/${state.mintedNftAddress}`,
            )

            if (fileInputRef.current) fileInputRef.current.value = ""
            if (trackInputRef.current) trackInputRef.current.value = ""

            navigate(`/track/${state.mintedNftAddress}`)

            setTimeout(() => {
                dispatch({ type: "RESET_FORM" })
            }, 100)
        }
    }, [state.mintingSuccess, state.mintedNftAddress, navigate])

    async function handleSubmit(e) {
        e.preventDefault()
        dispatch({ type: "SET_LOADING", isLoading: true })

        try {
            dispatch({ type: "SET_FORM_ERROR", formError: "" })

            if (state.musicImage) {
                const imageUrl = await ipfsUpload(state.selectedImageFile)
                dispatch({
                    type: "SET_FIELD_VALUE",
                    field: "ipfsImageUrl",
                    value: "ipfs://" + imageUrl.cid,
                })
                dispatch({
                    type: "SET_FIELD_VALUE",
                    field: "platformIfpsImageUrl",
                    value: imageUrl.url,
                })
            }

            if (state.selectedTrack) {
                const trackUrl = await ipfsUpload(state.selectedTrack)
                dispatch({
                    type: "SET_FIELD_VALUE",
                    field: "ipfsTrackUrl",
                    value: "ipfs://" + trackUrl.cid,
                })
                dispatch({
                    type: "SET_FIELD_VALUE",
                    field: "platformIpfsTrackUrl",
                    value: trackUrl.url,
                })
            }
        } catch (error) {
            dispatch({ type: "SET_FORM_ERROR", formError: error.message })
            dispatch({ type: "SET_LOADING", isLoading: false })
        }
    }

    function handleTrackChange(e) {
        const file = e.target.files[0]
        const maxSize = 20 * 1024 * 1024
        if (file && file.size > maxSize) {
            dispatch({ type: "SET_ERROR", error: "File size exceeds 20MB." })
            e.target.value = null
            return
        }
        dispatch({
            type: "SET_FIELD_VALUE",
            field: "selectedTrack",
            value: file,
        })
    }

    function handleFileChange(e) {
        const file = e.target.files[0]
        const maxSize = 2 * 1024 * 1024
        if (file && file.size > maxSize) {
            dispatch({ type: "SET_ERROR", error: "File size exceeds 2MB." })
            e.target.value = null
            return
        }
        dispatch({
            type: "SET_FIELD_VALUE",
            field: "selectedImageFile",
            value: file,
        })
        const reader = new FileReader()
        reader.onloadend = () => {
            dispatch({
                type: "SET_FIELD_VALUE",
                field: "musicImage",
                value: reader.result,
            })
        }
        reader.readAsDataURL(file)
    }

    if (!user?.isArtist) {
        return (
            <div className="p-8 box-border">
                <h1 className="text-5xl font-semibold mb-4">
                    You are not an artist
                </h1>
            </div>
        )
    }

    return (
        <div className="p-8 box-border">
            <h1 className="text-5xl font-semibold mb-4">Create Your Release</h1>
            <form
                method="POST"
                className="flex flex-col gap-4 bg-white border border-solid border-gray-300 p-8 mb-8"
            >
                {/* Cover Image Upload Section */}
                <div className="flex flex-col w-fit gap-2">
                    <label
                        htmlFor="musicImage"
                        className="mb-2 text-2xl font-['Acid_Grotesk_Medium'] text-[#424242]"
                    >
                        1. Pick a cover image
                    </label>
                    <div
                        className="relative w-[150px] h-[150px] rounded-[10%] overflow-hidden cursor-pointer group"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <img
                            src={state.musicImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Pen className="text-[#3CB4AC] w-[25px] h-[25px]" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <p className="text-xs text-[#666666] font-['Acid_Grotesk_Regular'] m-[0.3rem]">
                        {state.error ? state.error : "Max 2MB. (.jpg, .png)"}
                    </p>
                </div>

                {/* Release Name and Genre Selection */}
                <div className="flex gap-12 justify-between pr-60">
                    <div className="flex flex-col w-fit gap-2">
                        <label
                            htmlFor="musicName"
                            className="mb-2 text-2xl font-['Acid_Grotesk_Medium'] text-[#424242]"
                        >
                            2. What's the release called?
                        </label>
                        <input
                            type="text"
                            id="releaseName"
                            name="releaseName"
                            placeholder="Release Name"
                            className="border border-solid border-gray-400 p-2 rounded-lg focus:outline-none focus:border-gray-400"
                            value={state.releaseName}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "releaseName",
                                    value: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col w-fit gap-2">
                        <label
                            htmlFor="musicGenre"
                            className="mb-2 text-2xl font-['Acid_Grotesk_Medium'] text-[#424242]"
                        >
                            3. Select a genre
                        </label>
                        <select
                            id="musicGenre"
                            name="musicGenre"
                            className="border border-solid border-gray-400 p-2 rounded-lg focus:outline-none focus:border-gray-400"
                            value={state.genre}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "genre",
                                    value: e.target.value,
                                })
                            }
                        >
                            <option value="">Select a genre</option>
                            <option value="Hip-Hop">Hip Hop</option>
                            <option value="Rap">Rap</option>
                            <option value="Rock">Rock</option>
                            <option value="Pop">Pop</option>
                            <option value="Electronic">Electronic</option>
                            <option value="Country">Country</option>
                        </select>
                    </div>
                </div>

                {/* Mint Price Input */}
                <div className="flex flex-col w-fit gap-2">
                    <label
                        htmlFor="musicFile"
                        className="mb-2 text-2xl font-['Acid_Grotesk_Medium'] text-[#424242]"
                    >
                        4. Mint Price
                    </label>
                    <div className="flex items-center justify-center bg-[#424242] rounded-lg border-0 gap-2 pr-2">
                        <input
                            type="number"
                            id="mintPrice"
                            name="mintPrice"
                            placeholder="Mint Price"
                            className="border border-solid border-gray-400 p-2 rounded-lg focus:outline-none focus:border-gray-400 bg-[#424242] text-white placeholder-gray-300"
                            value={state.mintPrice}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "mintPrice",
                                    value: e.target.value,
                                })
                            }
                        />
                        <span className="text-[#F5F5F5] text-base">ETH</span>
                    </div>
                </div>

                {/* Music Track Upload Section */}
                <div className="flex flex-col w-fit gap-2">
                    <label
                        htmlFor="musicTrack"
                        className="mb-2 text-2xl font-['Acid_Grotesk_Medium'] text-[#424242]"
                    >
                        5. Select your music track
                    </label>
                    <div
                        className="w-full h-[100px] border-2 border-dashed border-[#ccc] rounded-lg flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out hover:border-[#007bff] hover:bg-blue-100/5"
                        onClick={() => trackInputRef.current.click()}
                    >
                        {state.selectedTrack ? (
                            <p className="text-base text-[#424242] break-all text-center px-4">
                                {state.selectedTrack.name}
                            </p>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Music className="w-8 h-8 mb-2" />
                                <p className="text-xs text-[#666666] font-['Acid_Grotesk_Regular'] m-[0.3rem]">
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
                    />
                    <p className="text-xs text-[#666666] font-['Acid_Grotesk_Regular'] m-[0.3rem]">
                        Max 20MB. (.mp3, .wav)
                    </p>
                </div>

                {/* track info /description  Input */}
                <div className="flex flex-col w-fit gap-2">
                    <label
                        htmlFor="info"
                        className="mb-2 text-2xl font-['Acid_Grotesk_Medium'] text-[#424242]"
                    >
                        6. Track Info
                    </label>
                    <div className="flex w-[1000px] gap-12 justify-between pr-60">
                        <textarea
                            type="text"
                            id="info"
                            name="info"
                            placeholder="Track Description"
                            className="w-full h-[150px] border border-solid border-gray-400 p-2 rounded-lg resize-y font-['Acid_Grotesk_Regular'] text-base focus:outline-none focus:border-gray-400"
                            value={state.info}
                            onChange={(e) =>
                                dispatch({
                                    type: "SET_FIELD_VALUE",
                                    field: "info",
                                    value: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-[#48CFCB] w-fit mt-6 text-[#F5F5F5] border-none px-4 py-2 rounded-lg cursor-pointer text-base font-medium font-['Acid_Grotesk_Medium'] disabled:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={state.isLoading || !state.isFormValid}
                >
                    {state.formError ? (
                        <span className="text-red-500 text-base font-medium font-['Acid_Grotesk_Medium']">
                            {state.formError}
                        </span>
                    ) : state.isLoading ? (
                        "Minting..."
                    ) : (
                        "Create"
                    )}
                </button>
            </form>
        </div>
    )
}

export default Create
