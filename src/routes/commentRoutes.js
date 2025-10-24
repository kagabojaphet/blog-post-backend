import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addComment,
  getCommentsByBlog,
  getCommentById,
  updateComment,
  deleteComment,
  deleteAllCommentsForBlog
} from "../controllers/commentController.js";

const router = express.Router();

// Add comment
router.post("/:blogId", protect, addComment);

// Get all comments for a blog
router.get("/blog/:blogId", getCommentsByBlog);

// Get a single comment
router.get("/:commentId", getCommentById);

// Update a comment
router.put("/:commentId", protect, updateComment);

// Delete a comment
router.delete("/:commentId", protect, deleteComment);

// Delete all comments for a blog
router.delete("/blog/:blogId", protect, deleteAllCommentsForBlog);

export default router;
