import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postsSchema = new Schema(
  {
    author: String,
    content: String,
  },

  {
    timestamps: true,
  }
);
const Post = mongoose.model("Post", postsSchema);
export { Post, postsSchema };
