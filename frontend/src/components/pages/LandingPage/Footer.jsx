import React from "react"
import { Github, Twitter, Linkedin } from "lucide-react"

const SocialLink = ({ href, Icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
    >
        <Icon size={20} />
    </a>
)

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-transparent text-gray-300 py-8 mt-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-center md:text-left">
                        &copy; {currentYear} DBeats. All rights reserved.
                    </div>

                    <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <a
                            href="#"
                            className="text-sm hover:text-emerald-400 transition-colors duration-200"
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="text-sm hover:text-emerald-400 transition-colors duration-200"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="text-sm hover:text-emerald-400 transition-colors duration-200"
                        >
                            Privacy Policy
                        </a>
                    </nav>

                    <div className="flex justify-center md:justify-end space-x-4">
                        <SocialLink href="#" Icon={Twitter} />
                        <SocialLink href="#" Icon={Github} />
                        <SocialLink href="#" Icon={Linkedin} />
                    </div>
                </div>
            </div>
        </footer>
    )
}
