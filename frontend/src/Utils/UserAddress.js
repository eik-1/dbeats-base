import { useWeb3ModalAccount } from "@web3modal/ethers/react"

export default function UserAddress() {
    const { address } = useWeb3ModalAccount()
    return address
}
