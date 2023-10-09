import mongoose from "mongoose";
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: String,
    spotifyId: String,
    tracks: Array,
    suggestions: Array,
  },

  {
    timestamps: true,
  }
);
const Playlist = mongoose.model("Playlist", playlistSchema);
export { Playlist, playlistSchema };
