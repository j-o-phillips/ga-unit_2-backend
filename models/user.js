import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: String,
    pods: [{ type: Schema.Types.ObjectId, ref: "Pod" }],
  },

  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export { User };
