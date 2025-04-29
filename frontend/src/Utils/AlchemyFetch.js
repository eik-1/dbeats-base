import {Network, Alchemy} from 'alchemy-sdk';


const settings = {
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ARB_SEPOLIA, 
  };
  
const alchemy = new Alchemy(settings);

const alchemyFetch = async (address) => {

    const owners = await alchemy.nft
  .getNftsForContract(address)

  const numberOfOwners = owners.nfts.length

  return numberOfOwners
}

export default alchemyFetch