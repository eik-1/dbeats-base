import dotenv from "dotenv";
import express from "express";
dotenv.config();

import {
  createMusicNFT,
  getArtistNfts,
  getExchangeRate,
  getLandingPageNfts,
  getLikes,
  getNftDetails,
  getNftMetadata,
  getNfts,
  getNumberOfOwners,
  isLiked,
  likeDislikeMusic,
} from "../controllers/nftController.js";

const router = express.Router();

/* FOR MARKET DISPLAY */
router.get("/getAll", getNfts);
router.post("/nftMetadata", getNftMetadata);
router.get("/landingPageNfts", getLandingPageNfts);
router.post("/getDetails", getNftDetails);
router.post("/createNFT", createMusicNFT);
router.post("/likeDislikeMusic", likeDislikeMusic);
router.get("/likes", getLikes);
router.post("/isLiked", isLiked);
router.post("/getExchangeRate", getExchangeRate);
router.get("/numberOfOwners", getNumberOfOwners);
router.get("/artistNfts", getArtistNfts);

export default router;
