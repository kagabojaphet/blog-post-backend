import express from "express";
import {
  submitContact,
  getAllContacts,
  getContact,
  replyContact,
  updateContact,
  deleteContact,
  deleteAllContacts
} from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/", submitContact);

// Admin
router.get("/", protect, getAllContacts);
router.get("/:id", protect, getContact);
router.post("/:id/reply", protect, replyContact);
router.put("/:id", protect, updateContact);
router.delete("/:id", protect, deleteContact);
router.delete("/", protect, deleteAllContacts);

export default router;