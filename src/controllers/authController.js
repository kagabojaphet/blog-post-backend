import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
export const register = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    // Send welcome email
    const message = `
      <h3>Welcome to Blog Post, ${user.name}!</h3>
      <p>You have successfully registered.</p>
    `;
    sendEmail(user.email, "Welcome to Blog Post!", message);

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Optional: send login notification email
    const message = `
      <p>Hello ${user.name},</p>
      <p>You just logged in to Blog Post.</p>
    `;
    sendEmail(user.email, "Login Notification", message);

    res.status(200).json({ token, userId: user._id, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Update a user
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (typeof isAdmin === "boolean") user.isAdmin = isAdmin;

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Delete all users (admin only)
export const deleteAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access denied" });

    const result = await User.deleteMany({});
    res.status(200).json({ message: `All users deleted (${result.deletedCount})` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
