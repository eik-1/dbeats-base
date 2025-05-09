import { motion } from "framer-motion"
import React from "react"

const RainbowButton = ({ onClick, children, disabled }) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className="relative py-3 px-4 w-1/2 rounded-3xl font-semibold z-auto text-zinc-50 overflow-hidden group disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 opacity-70 group-hover:opacity-100 transition duration-300 ease-out"></span>
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-70 transition duration-300 ease-out"></span>
            <span className="relative">{children}</span>
            <span className="absolute inset-0 w-full h-full rounded-lg"></span>
        </motion.button>
    )
}

export default RainbowButton
