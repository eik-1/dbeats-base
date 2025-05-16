import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import Logo from "../../Logo"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Navbar() {
    const buttonClasses =
        "bg-white hover:bg-gray-200 text-black font-semibold py-2 px-5 rounded-full flex items-center space-x-2 transition duration-200 text-lg"

    const [scrolledDown, setScrolledDown] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolledDown(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <motion.nav
            className={`fixed top-0 left-1/2 transform -translate-x-1/2 flex items-center justify-between py-4 px-6 lg:px-12 z-50 bg-transparent  ${scrolledDown ? "backdrop-blur-xl drop-shadow-md" : ""}`}
            initial={false}
            animate={{
                width: scrolledDown ? "75%" : "90%",
                marginTop: scrolledDown ? "0.7rem" : "0.7rem",
                borderRadius: scrolledDown ? "9999px" : "9999px",
            }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 0.7,
            }}
        >
            <Logo />

            <div className="flex items-center space-x-6">
                <Link
                    to="/"
                    className="text-white transition duration-200 text-lg font-normal"
                >
                    How it works
                </Link>
                <Link to="/app/market">
                    <button className={buttonClasses}>
                        <span>Launch App</span>
                        <ArrowRight size={16} />
                    </button>
                </Link>
            </div>
        </motion.nav>
    )
}
