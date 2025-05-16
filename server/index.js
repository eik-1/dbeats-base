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

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
