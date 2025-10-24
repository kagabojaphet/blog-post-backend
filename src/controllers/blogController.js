import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// ✅ Get all blogs with comments
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name email" },
        options: { sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single blog with comments
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
      .populate("author", "name email")
      .populate({
        path: "comments",
        populate: { path: "user", select: "name email" },
        options: { sort: { createdAt: -1 } },
      });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Create a new blog with Cloudinary image upload and category
export const createBlog = async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Access denied" });

  try {
    const { title, content, category } = req.body;

    // ✅ Validate category
    const validCategories = ["Technology", "Business", "Education", "Health", "Innovation"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    let imageUrl = "";

    // ✅ Upload image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "blog_images",
      });
      imageUrl = uploadResult.secure_url;

      // ✅ Remove local uploaded file after Cloudinary upload
      fs.unlinkSync(req.file.path);
    }

    const blog = await Blog.create({
      title,
      content,
      category,
      author: req.user.id,
      image: imageUrl,
    });

    // ✅ Notify all users about new blog
    const users = await User.find({}, "email name");
    users.forEach((user) => {
      const message = `
        <h3>New Blog Published: ${title}</h3>
        <p>Hello ${user.name},</p>
        <p>A new blog has been published. Please check it out!</p>
      `;
      sendEmail(user.email, `New Blog: ${title}`, message);
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Update blog (with optional Cloudinary image)
export const updateBlog = async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Access denied" });

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // ✅ If a new image is uploaded, replace old one
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (blog.image) {
        const publicId = blog.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`blog_images/${publicId}`);
      }

      // Upload new image
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "blog_images",
      });
      blog.image = uploadResult.secure_url;

      // Delete local temp file
      fs.unlinkSync(req.file.path);
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;

    const updatedBlog = await blog.save();
    res.status(200).json(updatedBlog);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Delete blog and Cloudinary image
export const deleteBlog = async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Access denied" });

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Delete image from Cloudinary
    if (blog.image) {
      const publicId = blog.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`blog_images/${publicId}`);
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Delete all blogs (and all Cloudinary images)
export const deleteAllBlogs = async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Access denied" });

  try {
    const blogs = await Blog.find({});
    for (const blog of blogs) {
      if (blog.image) {
        const publicId = blog.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`blog_images/${publicId}`);
      }
    }

    const result = await Blog.deleteMany({});
    res
      .status(200)
      .json({ message: `All blogs deleted (${result.deletedCount})` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Like a blog
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.likes.includes(req.user.id))
      return res.status(400).json({ message: "You already liked this blog" });

    blog.likes.push(req.user.id);
    blog.unlikes = blog.unlikes.filter(
      (userId) => userId.toString() !== req.user.id
    );

    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Unlike a blog
export const unlikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.unlikes.includes(req.user.id))
      return res.status(400).json({ message: "You already unliked this blog" });

    blog.unlikes.push(req.user.id);
    blog.likes = blog.likes.filter(
      (userId) => userId.toString() !== req.user.id
    );

    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Share a blog
export const shareBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.shares.includes(req.user.id))
      return res.status(400).json({ message: "You already shared this blog" });

    blog.shares.push(req.user.id);
    await blog.save();

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
