import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Admin from "./pages/Admin"
import AppLayout from "./pages/AppLayout"
import Create from "./pages/Create"
import LandingPage from "./pages/LandingPage"
import Market from "./pages/Market"
import Profile from "./pages/Profile"
import TrackInfo from "./pages/TrackInfo"
import UsersProfile from "./pages/UsersProfile"

import EditProfile from "./components/EditProfile"
import Error from "./components/ui/Error"
import { MusicProvider } from "./contexts/MusicProvider"
import { UserProvider } from "./contexts/UserProvider"
import MyMusic from "./pages/MyMusic"

const projectId = import.meta.env.VITE_WALLETCONNECT_ID

const mainnet = {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: import.meta.env.VITE_ETH_MAINNET_RPC,
}

const base = {
    chainId: 8453,
    name: "Base",
    currency: "ETH",
    rpcUrl: import.meta.env.VITE_BASE_RPC,
}
const arbitrumSepolia = {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    currency: "ETH",
    rpcUrl: import.meta.env.VITE_ARB_SEPOLIA_RPC,
}

const metadata = {
    name: "DBeats",
    description: "NFT Marketplace For Music",
    url: "https://dbeats.xyz", // origin must match your domain & subdomain
    icons: [],
}

const ethersConfig = defaultConfig({
    metadata,
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    defaultChainId: 1, // used for the Coinbase SDK
    auth: {
        email: true,
        socials: ["google", "x", "apple", "farcaster"],
        showWallets: true,
        walletFeatures: true,
    },
})

createWeb3Modal({
    ethersConfig,
    chains: [arbitrumSepolia, mainnet, base],
    projectId,
    enableAnalytics: true,
    themeMode: "light",
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
    },
})

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
        errorElement: <Error />,
    },
    {
        path: "/app",
        element: <AppLayout />,
        errorElement: <Error />,
        children: [
            {
                path: "profile",
                element: <Profile />,
                errorElement: <Error />,
            },
            {
                path: "profile/edit",
                element: <EditProfile />,
                errorElement: <Error />,
            },
            {
                path: "admin",
                element: <Admin />,
                errorElement: <Error />,
            },
            {
                path: "create",
                element: <Create />,
                errorElement: <Error />,
            },
            {
                path: ":name",
                element: <UsersProfile />,
                errorElement: <Error />,
            },
            {
                path: "track/:address",
                element: <TrackInfo />,
                errorElement: <Error />,
            },
            {
                path: "market",
                element: <Market />,
                errorElement: <Error />,
            },
            {
                path: "my-music",
                element: <MyMusic />,
                errorElement: <Error />,
            },
        ],
    },
])

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <UserProvider>
                <MusicProvider>
                    <RouterProvider router={router} />
                </MusicProvider>
            </UserProvider>
        </QueryClientProvider>
    )
}

export default App
