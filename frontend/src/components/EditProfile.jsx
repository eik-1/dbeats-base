import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Pen } from "lucide-react"

import { useUser } from "../contexts/UserProvider"
import ipfsUpload from "../Utils/ipfsUpload"

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
            const { url } = await ipfsUpload(selectedFile)
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
            navigate("/app/profile")
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0]
        const maxSize = 2 * 1024 * 1024

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
            <h2 className="text-2xl mb-4 font-semibold text-zinc-50">
                Edit Profile
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <div
                        className="relative w-36 h-36 rounded-full overflow-hidden cursor-pointer"
                        onClick={handleImageClick}
                    >
                        <img
                            src={profPicture}
                            alt="Profile"
                            className="w-36 h-36 rounded-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <Pen className="text-emerald-500 w-[25px] h-[25px]" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <p className="text-sm text-zinc-400 m-[0.3rem]">
                        {error ? error : "Max 2MB. (.jpg, .png)"}
                    </p>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="name" className="mb-2  text-zinc-50">
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
                    <label htmlFor="about" className="mb-2 text-zinc-50">
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
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500 text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-3xl"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/app/profile")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-red-400 text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-3xl"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProfile
