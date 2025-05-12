import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "User" },
  about: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  twitterUsername: { type: String },
  walletAddress: { type: String, required: true, unique: true },
  isArtist: { type: Boolean, default: false },
  hasApplied: { type: Boolean, default: false },
  followersCount: { type: Number, default: 0 },
  mintedNfts: { type: [String], default: [] },
  likedSongs: { type: [String], default: [] },
});

const User = mongoose.model("User", userSchema);

export default User;
