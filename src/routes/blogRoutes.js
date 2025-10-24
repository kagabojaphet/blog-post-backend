import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js"; // ✅ Use your existing upload middleware
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  deleteAllBlogs,
  likeBlog,
  unlikeBlog,
  shareBlog,
} from "../controllers/blogController.js";

const router = express.Router();

console.log("📦 blogRoutes loaded");

// ✅ Public routes
router.get("/", getAllBlogs);
router.get("/:blogId", getBlogById);

// ✅ Admin routes (with Cloudinary + Multer middleware)
router.post("/", protect, upload.single("image"), createBlog);
router.put("/:id", protect, upload.single("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);
router.delete("/", protect, deleteAllBlogs);

// ✅ User actions
router.post("/:id/like", protect, likeBlog);
router.post("/:id/unlike", protect, unlikeBlog);
router.post("/:id/share", protect, shareBlog);

export default router;
