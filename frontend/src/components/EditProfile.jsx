import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Pen } from "lucide-react"

import { pinata } from "../Utils/pinataConfig"
import { useUser } from "../contexts/UserProvider"

const EditProfile = () => {
    const { user, updateUser } = useUser()
    const [selectedFile, setSelectedFile] = useState()
    const [profPicture, setProfPicture] = useState(user.profilePicture)
    const [name, setName] = useState(user.name)
    const [about, setAbout] = useState(user.about)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const fileInputRef = useRef(null)

    function handleImageClick() {
        fileInputRef.current.click()
    }

    async function handleSubmit(e) {
        try {
            setIsLoading(true)
            e.preventDefault()
            console.log("selectedFile", selectedFile)
            const upload = await pinata.upload.file(selectedFile)
            const cid = upload.data.cid
            const url = await pinata.gateways.createSignedURL({
                cid,
                expires: 315400000,
            })
            const newUser = {
                ...user,
                profilePicture: url,
                name,
                about,
            }
            updateUser(newUser)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
            navigate("/profile")
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0]
        const maxSize = 2 * 1024 * 1024 // 2MB in bytes

        if (file && file.size > maxSize) {
            setError("File size exceeds 2MB.")
            e.target.value = null
            return
        }
        setSelectedFile(file)
        if (file) {
            setError("")
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfPicture(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="p-8 box-border">
            <h2 className="text-2xl mb-4 font-['Acid_Grotesk_Bold'] text-[#424242]">
                Edit Profile
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <div
                        className="relative w-[150px] h-[150px] rounded-[10%] overflow-hidden cursor-pointer"
                        onClick={handleImageClick}
                    >
                        <img
                            src={profPicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
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
                    <p className="text-sm text-[#666666] font-['Acid_Grotesk_Regular'] m-[0.3rem]">
                        {error ? error : "Max 2MB. (.jpg, .png)"}
                    </p>
                </div>
                <div className="flex flex-col">
                    <label
                        htmlFor="name"
                        className="mb-2 font-['Acid_Grotesk_Medium'] text-[#424242]"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-2 border border-[#e0e0e0] rounded"
                    />
                </div>
                <div className="flex flex-col">
                    <label
                        htmlFor="about"
                        className="mb-2 font-['Acid_Grotesk_Medium'] text-[#424242]"
                    >
                        About
                    </label>
                    <textarea
                        id="about"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="p-2 border border-[#e0e0e0] rounded min-h-[100px] resize-y"
                    />
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-[#3CB4AC] text-[#F5F5F5] font-['Acid_Grotesk_Medium'] hover:bg-[#2A7D77] transition-colors duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="px-4 py-2 rounded bg-[#e0e0e0] text-[#424242] font-['Acid_Grotesk_Medium'] hover:bg-[#999999] transition-colors duration-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProfile
