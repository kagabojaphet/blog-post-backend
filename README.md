# 📰 MyBlog Backend API

This is the **backend API** for the **MyBlog web application**.  
It handles authentication, blog management, comments, contact messages, and file uploads (via Cloudinary).

---

## ⚙️ Tech Stack

- **Node.js** + **Express.js**
- **MongoDB (Mongoose ODM)**
- **Cloudinary** (for image upload)
- **JWT Authentication**
- **Nodemailer** (for sending contact emails)
- **dotenv** (for environment configuration)

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/kagabojaphet/blog-post-backend.git
cd myblog-backend

Install dependencies: npm install
Create a .env file in the root directory

Add your configuration:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_key

Development Mode: npm run dev
Production Mode: npm start
Server will start on: http://localhost:5000
