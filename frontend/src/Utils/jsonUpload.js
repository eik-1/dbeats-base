import { pinata } from "./pinataConfig"

const groupId = import.meta.env.VITE_PINATA_GROUP_ID
const gatewayUrl = import.meta.env.VITE_PINATA_GATEWAY_URL

const jsonUpload = async (props) => {
    try {
        const upload = await pinata.upload.json(props).group(groupId)
        const cid = upload.IpfsHash
        const url = `https://${gatewayUrl}/ipfs/${cid}`
        return url
    } catch (error) {
        console.error("Error uploading file:", error)
    }
}

export default jsonUpload
