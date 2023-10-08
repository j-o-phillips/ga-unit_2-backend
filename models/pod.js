import mongoose from "mongoose";
const Schema = mongoose.Schema;

const podSchema = new Schema(
  {
    name: String,
    users: Array,
    playlists: Array,
    posts: Array,
  },

  {
    timestamps: true,
  }
);
const Pod = mongoose.model("Pod", podSchema);
export { Pod };
