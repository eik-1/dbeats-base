import { Link } from "react-router-dom"
import logo from "../assets/logo.png"

export default function Logo({
    logoWidth = "w-8",
    logoHeight = "h-9",
    textSize = "md:text-6xl",
}) {
    return (
        <Link to="/" className="flex max-h-fit justify-around gap-2 md:gap-2">
            <img
                src={logo}
                alt="dbeats-logo"
                className={`${logoWidth} ${logoHeight} md:w-10 md:h-11 mt-1`}
            />
            <span
                className={`text-white max-h-fit font-black text-4xl ${textSize} font-[Zain] p-0`}
            >
                dbeats
            </span>
        </Link>
    )
}
