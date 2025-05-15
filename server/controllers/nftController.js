import axios from "axios";
import dotenv from "dotenv";
import { gql, request } from "graphql-request";

import Music from "../models/Music.js";
import User from "../models/User.js";
import { alchemy } from "../index.js";
dotenv.config();

const url = process.env.SUBGRAPH_URL;

export const getLikes = async (req, res) => {
  const { address } = req.query;
  const nftAddress = address.toLowerCase();
  try {
    const music = await Music.findOne({
      address: { $regex: new RegExp(`^${nftAddress}$`, "i") },
    });
    if (!music) return res.status(404).json({ message: "Music not found" });
    const likeCount = music.likeCount || 0;
    res.status(200).json({ likeCount });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error fetching likes", error: err.message });
  }
};

export const createMusicNFT = async (req, res) => {
  try {
    console.log("Creating music NFT with data:", req.body);
    const newMusic = new Music(req.body);
    await newMusic.save();
    console.log("Music NFT created successfully:", newMusic);
    res.status(201).json(newMusic);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating a music nft", error: err.message });
  }
};

export const isLiked = async (req, res) => {
  const { nftAddress, userAddress } = req.body;
  const lowerCaseAddress = nftAddress.toLowerCase();
  try {
    const user = await User.findOne({
      walletAddress: userAddress,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    const hasLiked = user.likedSongs.includes(lowerCaseAddress);
    res.status(200).json({ hasLiked });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error fetching likes", error: err.message });
  }
};

export const likeDislikeMusic = async (req, res) => {
  const { nftAddress, userAddress } = req.body;
  const lowerCaseAddress = nftAddress.toLowerCase();

  try {
    const user = await User.findOne({
      walletAddress: userAddress,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const music = await Music.findOne({
      address: { $regex: new RegExp(`^${lowerCaseAddress}$`, "i") },
    });
    if (!music) return res.status(404).json({ message: "Music not found" });

    // If the user has already liked the music, remove the like
    if (user.likedSongs.includes(lowerCaseAddress)) {
      user.likedSongs = user.likedSongs.filter(
        (addr) => addr !== lowerCaseAddress
      );
      music.likeCount = Math.max((music.likeCount || 0) - 1, 0);
    }
    // Else, add the like and save the nftAddress to the user's likedSongs
    else {
      user.likedSongs.push(lowerCaseAddress);
      music.likeCount = (music.likeCount || 0) + 1;
    }
    await user.save();
    await music.save();
    console.log("Music updated successfully", music);
    console.log("User updated successfully", user);
    res.status(200).json({ message: "Liked the music nft" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error liking the music nft", error: err.message });
  }
};

export const getLandingPageNfts = async (req, res) => {
  try {
    const nfts = await Music.find({}).sort({ likeCount: -1 }).limit(4);
    let nftDetails = [];
    let nftMetadata = [];
    await Promise.all(
      nfts.map(async (nft) => {
        const details = await getNftDetailsInternal(nft.address);
        if (details) {
          nftDetails.push(details.nfts[0]);
        }
      })
    );
    await Promise.all(
      nftDetails.map(async (nft) => {
        const metadata = await getNftMetadataInternal(nft.tokenURI);
        if (metadata) {
          nftMetadata.push(metadata);
        }
      })
    );
    res.status(200).json({ nftDetails, nftMetadata });
  } catch (err) {
    console.error("Error fetching landing page NFTs:", err);
    res.status(500).json({
      message: "Error fetching landing page NFTs",
      error: err.message,
    });
  }
};

export const getNfts = async (req, res) => {
  const query = gql`
    {
      nfts {
        id
        address
        artist {
          id
        }
        tokenURI
        genre
        mintPrice
      }
    }
  `;

  try {
    const data = await request(url, query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching NFTs from subgraph:", error);
    res.status(500).json({ error: "Failed to fetch NFTs" });
  }
};

export const getNftDetailsInternal = async (nftAddress) => {
  const query = gql`
    query GetNftDetails($address: String!) {
      nfts(where: { address: $address }) {
        address
        name
        mintPrice
        tokenURI
        genre
        artist {
          id
        }
      }
    }
  `;
  try {
    const variables = { address: nftAddress };
    const data = await request(url, query, variables);
    return data;
  } catch (error) {
    console.error("Error fetching details of the NFT", error);
    return null;
  }
};

export const getNftDetails = async (req, res) => {
  const { nftAddress } = req.body;

  const query = gql`
    query GetNftDetails($address: String!) {
      nfts(where: { address: $address }) {
        address
        name
        mintPrice
        tokenURI
        genre
        artist {
          id
        }
      }
    }
  `;
  try {
    const variables = { address: nftAddress };
    const data = await request(url, query, variables);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching details of the NFT", error);
    res.status(500).json({ error: "Failed to fetch the details" });
  }
};

export const getNftMetadata = async (req, res) => {
  let { uri } = req.body;

  if (uri && !uri.startsWith("https://")) {
    uri = uri.replace("ipfs://", "");
    uri = `https://indigo-neighbouring-smelt-221.mypinata.cloud/ipfs/${uri}`;
  }

  if (uri) {
    try {
      const response = await axios.get(uri);
      const nftData = response.data;
      res.json(nftData);
    } catch (error) {
      res.status(200).json({ error: "Failed to fetch NFT metadata" });
    }
  } else {
    res.status(400).json({ error: "Invalid URI" });
  }
};

export const getNftMetadataInternal = async (uri) => {
  if (uri && !uri.startsWith("https://")) {
    uri = `https://${uri}`;
  }
  if (uri) {
    try {
      const response = await axios.get(uri);
      const nftData = response.data;
      return nftData;
    } catch (error) {
      return null;
    }
  } else {
    return null;
  }
};

export const getExchangeRate = async (req, res) => {
  const { mintPrice } = req.body;
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
  const COINGECKO_API = process.env.COINGECKO_API;

  const response = await axios.get(url, {
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": COINGECKO_API,
    },
  });
  const data = response.data;
  const exchangeRate = data.ethereum.usd;
  const usdPrice = parseFloat(mintPrice / 10 ** 18) * exchangeRate;
  res.status(200).json({ usdPrice });
};

export const getNumberOfOwners = async (req, res) => {
  try {
    const { address } = req.query;
    console.log("address is ", address);
    const owners = await alchemy.nft.getNftsForContract(address);
    const numberOfOwners = owners.nfts.length;
    res.json(numberOfOwners);
  } catch (error) {
    console.error("Error fetching number of owners:", error);
    res.status(500).json({ error: "Failed to fetch number of owners" });
  }
};

export const getArtistNfts = async (req, res) => {
  const walletAddress = req.query.walletAddress;
  console.log("Extracted walletAddress:", walletAddress);

  const query = gql`
    query MyQuery($artistId: String!) {
      artist(id: $artistId) {
        address
        nfts {
          tokenURI
          mintPrice
          address
        }
      }
    }
  `;

  try {
    const data = await request(url, query, { artistId: walletAddress });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from subgraph:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
