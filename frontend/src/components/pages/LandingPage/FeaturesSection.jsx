import React from "react"
import { Lock, Globe, DollarSign, User } from "lucide-react"

const features = [
    {
        Icon: Lock,
        title: "Own",
        subtitle: "what you listen to",
        color: "text-emerald-400",
    },
    {
        Icon: Globe,
        title: "Global",
        subtitle: "and Open",
        color: "text-emerald-400",
    },
    {
        Icon: DollarSign,
        title: "Earn as",
        subtitle: "You Release",
        color: "text-emerald-400",
    },
    {
        Icon: User,
        title: "Direct",
        subtitle: "Support to Artists",
        color: "text-emerald-400",
    },
]

function FeatureItem({ Icon, title, subtitle, color }) {
    return (
        <div className="flex items-center space-x-4">
            <div
                className={`w-10 h-10 ${color} flex items-center justify-center`}
            >
                <Icon size={32} className={color} />
            </div>
            <div className="text-white">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-300">{subtitle}</p>
            </div>
        </div>
    )
}

export default function FeaturesSection() {
    return (
        <section className="py-16 md:p-0 bg-transparent">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-center  items-center gap-8 md:gap-12">
                    {features.map((feature, index) => (
                        <FeatureItem
                            key={index}
                            Icon={feature.Icon}
                            title={feature.title}
                            subtitle={feature.subtitle}
                            color={feature.color}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
