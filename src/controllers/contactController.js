// src/controllers/contactController.js
import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ Public - submit contact with automatic reply
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: "All fields are required" });

    const contact = await Contact.create({ name, email, subject, message });

    // Auto-reply to user
    await sendEmail(
      email,
      `Thank you for contacting us: ${subject}`,
      `<p>Hello ${name},</p><p>Thank you for reaching out. We will get back to you soon!</p>`
    );

    // Update autoResponseSent
    contact.autoResponseSent = true;
    await contact.save();

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin - get all contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin - get one contact
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin - reply to a contact (saves reply in DB)
export const replyContact = async (req, res) => {
  try {
    const { adminReply } = req.body;
    if (!adminReply) return res.status(400).json({ message: "Reply message required" });

    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    // Send reply email
    await sendEmail(
      contact.email,
      `Response to your message: ${contact.subject}`,
      `<p>Hello ${contact.name},</p><p>${adminReply}</p>`
    );

    // Save reply in DB
    contact.adminReply = adminReply;
    contact.status = "responded";
    await contact.save();

    res.status(200).json({ message: "Reply sent and saved successfully", contact });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin - update a contact
export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin - delete one contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin - delete all contacts
export const deleteAllContacts = async (req, res) => {
  try {
    await Contact.deleteMany({});
    res.status(200).json({ message: "All contacts deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
