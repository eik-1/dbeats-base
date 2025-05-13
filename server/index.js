import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
dotenv.config();

import nftRouter from "./routes/nft.js";
import userRouter from "./routes/users.js";

const app = express();

const port = 3000;
const url = process.env.SUBGRAPH_URL;

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ARB_SEPOLIA,
};

export const alchemy = new Alchemy(settings);

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Connect to MongoDB
mongoose.connect(
  `mongodb+srv://eik:${process.env.MONGOOSE_PASSWORD}@dbeats.8elky.mongodb.net/?retryWrites=true&w=majority&appName=DBeats`
);

//Routes
app.use("/user", userRouter);
app.use("/nft", nftRouter);

app.get("/getData", async (req, res) => {
  const tokenURI = req.query.uri;
  const decodedUrl = decodeURIComponent(tokenURI);
  try {
    const response = await axios.get(decodedUrl);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error fetching NFT data:", error);
    res.status(500).json({ error: "Failed to fetch NFT data" });
  }
});

app.get("/nftData", async (req, res) => {
  const { uri, address } = req.query;

  try {
    // Fetch NFT metadata
    const response = await axios.get(uri);
    const nftData = response.data;

    // Fetch additional data (e.g., number of owners) if needed
    const numberOfOwners = await alchemyFetch(address);

    // Combine data
    const data = {
      name: nftData.name,
      image: nftData.image_url,
      artist: nftData.creator,
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching NFT data:", error);
    res.status(500).json({ error: "Failed to fetch NFT data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
