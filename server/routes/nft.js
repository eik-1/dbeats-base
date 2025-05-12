import dotenv from "dotenv";
import express from "express";
dotenv.config();

import {
  createMusicNFT,
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
import getArtistNfts from "../../frontend/src/Utils/services/getArtistNfts.js";

const router = express.Router();

/* FOR MARKET DISPLAY */
router.get("/getAll", getNfts);
router.post("/nftMetadata", getNftMetadata);
router.get("/landingPageNfts", getLandingPageNfts);
router.post("/getOne", getNftDetails);
router.post("/createNFT", createMusicNFT);
router.post("/likeDislikeMusic", likeDislikeMusic);
router.get("/likes", getLikes);
router.post("/isLiked", isLiked);
router.post("/getExchangeRate", getExchangeRate);
router.get("/numberOfOwners", getNumberOfOwners);
router.get("/artistNfts", getArtistNfts);

export default router;
