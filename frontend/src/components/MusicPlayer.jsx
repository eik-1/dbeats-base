import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"
import React, { useEffect, useState } from "react"

import { useMusic } from "../contexts/MusicProvider"
import UserAddress from "../Utils/UserAddress"
import LikeDislikeButton from "./LikeDislikeButton"

function MusicPlayer() {
    const {
        currentTrack,
        isPlaying,
        pauseTrack,
        resumeTrack,
        seekTo,
        setVolume,
        audioRef,
    } = useMusic()
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volumeHere, setVolumeHere] = useState(audioRef.current.volume)
    const userAddress = UserAddress()

    useEffect(() => {
        const audio = audioRef.current
        const updateProgress = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)

        audio.addEventListener("timeupdate", updateProgress)
        audio.addEventListener("loadedmetadata", updateDuration)

        return () => {
            audio.removeEventListener("timeupdate", updateProgress)
            audio.removeEventListener("loadedmetadata", updateDuration)
        }
    }, [audioRef])

    const togglePlay = () => {
        if (isPlaying) {
            pauseTrack()
        } else {
            resumeTrack()
        }
    }

    const handleProgressChange = (e) => {
        const newTime = e.target.value
        setCurrentTime(newTime)
        seekTo(newTime)
    }

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value
        setVolume(newVolume)
        setVolumeHere(newVolume)
    }

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }

    if (!currentTrack) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 text-zinc-50 p-4 flex justify-between items-center h-[110px]">
            <div className="flex items-center">
                <div className="w-16 h-16 rounded-md mr-4">
                    <img
                        src={currentTrack.imageUrl}
                        alt={currentTrack.name}
                        className="object-cover rounded-md h-full w-full"
                    />
                </div>

                <div>
                    <h3 className="text-xl font-semibold">
                        {currentTrack.name}
                    </h3>
                    <p className="text-sm text-secondary cursor-pointer">
                        {currentTrack.artist}
                    </p>
                </div>
                <LikeDislikeButton
                    nftAddress={currentTrack.id}
                    userAddress={userAddress}
                />
            </div>
            <div className="flex flex-col items-center justify-center mx-auto">
                <div className="flex items-center justify-around gap-4 w-full">
                    <span className="text-sm w-8">
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleProgressChange}
                        style={{
                            background: `linear-gradient(to right, oklch(69.6% 0.17 162.48) ${(currentTime / duration) * 100}%, #E0E0E0 ${(currentTime / duration) * 100}%)`,
                        }}
                        className="w-[32rem] h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="text-sm w-8">{formatTime(duration)}</span>
                </div>
                <div className="mt-2 flex items-center justify-center w-full max-w-[32rem]">
                    <button className="bg-transparent border-none text-secondary mx-2 cursor-pointer">
                        <SkipBack size={22} fill="oklch(98.5% 0 0)" />
                    </button>
                    <button
                        className="bg-primary text-primary rounded-full p-2 mx-4 cursor-pointer"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause size={24} fill="oklch(98.5% 0 0)" />
                        ) : (
                            <Play size={24} fill="oklch(98.5% 0 0)" />
                        )}
                    </button>
                    <button className="bg-transparent border-none text-secondary mx-2 cursor-pointer">
                        <SkipForward size={22} fill="oklch(98.5% 0 0)" />
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-around mr-20">
                <span className="text-secondary">
                    <Volume2 size={20} fill="#7b92b2" />
                </span>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volumeHere}
                    onChange={handleVolumeChange}
                    style={{
                        background: `linear-gradient(to right, oklch(69.6% 0.17 162.48) ${volumeHere * 100}%, #E0E0E0 ${volumeHere * 100}%)`,
                    }}
                    className="w-24 h-2 rounded-full appearance-none ml-2 cursor-pointer 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:cursor-pointer"
                />
            </div>
        </div>
    )
}

export default MusicPlayer
