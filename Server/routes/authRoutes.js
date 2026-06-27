// Server/routes/authRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { register, login, authenticateJWT, getProfile } = require("../controllers/authController");

const router = express.Router();

// --- Multer Configuration ---
const uploadDir = path.join(__dirname, "..", "..", "uploads", "influencer_photos");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory at: ${uploadDir}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only image files are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// --- Routes ---
router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.get("/profile", authenticateJWT, getProfile);

// --- Multer & General Error Handler ---
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer Error:", err);
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
        console.error("Unexpected error:", err);
        const status = err.message.includes("Invalid file type") ? 400 : 500;
        return res.status(status).json({ message: err.message });
    }
    next();
});

module.exports = router;
