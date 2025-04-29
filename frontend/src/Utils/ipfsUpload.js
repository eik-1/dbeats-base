import { pinata } from "./pinataConfig"

const groupId = import.meta.env.VITE_PINATA_GROUP_ID
const gatewayUrl = import.meta.env.VITE_PINATA_GATEWAY_URL

const ipfsUpload = async (file) => {
    try {
        const upload = await pinata.upload.file(file).group(groupId)
        const cid = upload.IpfsHash
        const url = `https://${gatewayUrl}/ipfs/${cid}`
        return {
            url,
            cid,
        }
    } catch (error) {
        console.error("Error uploading file:", error)
        throw error
    }
}
export default ipfsUpload
