import mongoose from "mongoose";
import { suggestionSchema } from "./suggestions.js";
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: String,
    spotifyId: String,
    tracks: Array,
    suggestions: [suggestionSchema],
  },

  {
    timestamps: true,
  }
);
const Playlist = mongoose.model("Playlist", playlistSchema);
export { Playlist, playlistSchema };
