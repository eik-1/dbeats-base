import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
  address: { type: String, required: true },
  name: { type: String, required: true },
  likeCount: { type: Number, default: 0 },
  genre: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Music = mongoose.model("Music", musicSchema);

export default Music;
