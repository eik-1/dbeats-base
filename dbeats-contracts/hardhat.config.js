require('@nomicfoundation/hardhat-toolbox')
require('@nomiclabs/hardhat-ethers')
require('hardhat-gas-reporter')
require('hardhat-contract-sizer')
require('@nomicfoundation/hardhat-ignition-ethers')
require('dotenv').config()

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const BASE_RPC_URL = process.env.BASE_RPC_URL
const SONEIUM_RPC_URL = process.env.SONEIUM_RPC_URL
const SONEIUM_TESTNET_RPC_URL = process.env.SONEIUM_TESTNET_RPC_URL
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL
const COINMARKETCAP_API = process.env.COINMARKETCAP_API

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        base: {
            allowUnlimitedContractSize: true,
            url: BASE_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 8453,
            gasPrice: 20000000000,
        },
        baseSepolia: {
            allowUnlimitedContractSize: true,
            url: BASE_SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 84532,
            gasPrice: 20000000000,
        },
        // soneium: {
        //     allowUnlimitedContractSize: true,
        //     url: SONEIUM_RPC_URL,
        //     accounts: [PRIVATE_KEY],
        //     chainId: 1868,
        //     gasPrice: 20000000000,
        // },
        // soneiumTestnet: {
        //     allowUnlimitedContractSize: true,
        //     url: SONEIUM_TESTNET_RPC_URL,
        //     accounts: [PRIVATE_KEY],
        //     chainId: 1946,
        //     gasPrice: 20000000000,
        // },
    },
    solidity: '0.8.24',
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
            details: { yul: false },
        },
    },
    etherscan: {
        apiKey: {
            baseSepolia: ETHERSCAN_API_KEY,
            base: ETHERSCAN_API_KEY,
        },
        customChains: [
            {
                network: 'baseSepolia',
                chainId: 84532,
                urls: {
                    apiURL: 'https://api-sepolia.basescan.org/api',
                    browserURL: 'https://sepolia.basescan.org',
                },
            },
        ],
    },
    gasReporter: {
        enabled: false,
        currency: 'ETH',
        // L2: 'arbitrum',
        // L2Etherscan: process.env.ARB_API_KEY,
        // gasPrice: 21,
        coinmarketcap: COINMARKETCAP_API,
    },
}
