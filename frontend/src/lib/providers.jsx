import { OnchainKitProvider } from "@coinbase/onchainkit"
import { baseSepolia } from "wagmi/chains"

export function Providers({ children }) {
    return (
        <OnchainKitProvider
            apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
            chain={baseSepolia}
        >
            {children}
        </OnchainKitProvider>
    )
}
