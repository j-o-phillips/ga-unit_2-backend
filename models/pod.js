import mongoose from "mongoose";
import { Playlist, playlistSchema } from "./playlist.js";
import { postsSchema } from "./posts.js";

const Schema = mongoose.Schema;

const podSchema = new Schema(
  {
    name: String,
    admins: Array,
    users: Array,
    playlists: [playlistSchema],
    posts: [postsSchema],
  },

  {
    timestamps: true,
  }
);
const Pod = mongoose.model("Pod", podSchema);
export { Pod };
