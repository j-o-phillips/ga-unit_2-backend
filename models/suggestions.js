import mongoose from "mongoose";
const Schema = mongoose.Schema;

const suggestionSchema = new Schema(
  {
    id: String,
    name: String,
    artist: String,
    album: String,
    uri: String,
    likes: Array,
  },

  {
    timestamps: true,
  }
);
const Suggestion = mongoose.model("Suggestion", suggestionSchema);
export { Suggestion, suggestionSchema };
