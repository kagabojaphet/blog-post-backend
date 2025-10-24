// src/controllers/commentController.js
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

// ==========================
// Add a comment

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

    const blog = await Blog.findById(req.params.blogId).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = new Comment({
      blog: req.params.blogId,
      user: req.user.id,
      content,
    });

    await comment.save();

    // Link comment to blog
    blog.comments.push(comment._id);
    await blog.save();

    const populatedComment = await comment.populate("user", "name email");

    // ✅ Email notification removed

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// Get all comments for a blog
// ==========================
export const getCommentsByBlog = async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Get a single comment by ID
// ==========================
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("user", "name email");
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Update a comment
// ==========================
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only admin or comment owner can update
    if (!req.user.isAdmin && comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    comment.content = content || comment.content;
    await comment.save();

    const populatedComment = await comment.populate("user", "name email");
    res.status(200).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Delete a single comment
// ==========================
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only admin or comment owner can delete
    if (!req.user.isAdmin && comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    await comment.deleteOne();

    // Remove reference from blog
    await Blog.findByIdAndUpdate(comment.blog, { $pull: { comments: comment._id } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Delete all comments for a blog (admin only)
// ==========================
export const deleteAllCommentsForBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Only admin can delete all comments
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Access denied" });

    await Comment.deleteMany({ blog: req.params.blogId });
    blog.comments = [];
    await blog.save();

    res.status(200).json({ message: "All comments deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
