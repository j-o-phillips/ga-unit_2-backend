import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: String,
    accessToken: String,
  },

  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export { User };
