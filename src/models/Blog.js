import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["Technology", "Business", "Education", "Health", "Innovation"],
      required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String }, // optional image URL
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    unlikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
