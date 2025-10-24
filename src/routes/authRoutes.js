// src/routes/authRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteAllUsers
} from "../controllers/authController.js"; // or userController.js if renamed

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/", protect, getAllUsers);             // Get all users (admin recommended)
router.get("/:userId", protect, getUserById);     // Get single user
router.put("/:userId", protect, updateUser);      // Update user
router.delete("/:userId", protect, deleteUser);   // Delete single user
router.delete("/", protect, deleteAllUsers);      // Delete all users (admin only)

export default router;
