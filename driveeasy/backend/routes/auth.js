const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authenticate"); // Updated to point to authenticate.js

// Configure multer for file uploads (used in /signup)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
    cb(null, true);
  },
}).any();

async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

// Signup route
router.post("/signup", upload, async (req, res) => {
  const { email, password } = req.body;
  const files = req.files;
  let client;

  try {
    client = await connectToDatabase();
    const db = client.db("driveeasy");

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const license = files.find(file => file.fieldname === "license");
    const pin = files.find(file => file.fieldname === "pin");
    const images = files.filter(file => file.fieldname === "images");

    if (!license || !pin) {
      return res.status(400).json({ message: "License and proof of identity are required" });
    }
    if (images.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashedPassword,
      verified: false,
      license: license ? license.buffer.toString("base64") : null,
      pin: pin ? pin.buffer.toString("base64") : null,
      images: images ? images.map(file => file.buffer.toString("base64")) : [],
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    const token = jwt.sign({ id: result.insertedId.toString() }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      id: result.insertedId.toString(),
      email,
      token,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error("Error in /signup endpoint:", error);
    if (error.message.includes("Invalid file type")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating user", error: error.message });
  } finally {
    client && client.close();
  }
});

// Signin route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  let client;

  try {
    client = await connectToDatabase();
    const db = client.db("driveeasy");

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({
      id: user._id.toString(),
      email: user.email,
      token,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error("Error in /signin endpoint:", error);
    res.status(500).json({ message: "Error signing in", error: error.message });
  } finally {
    client && client.close();
  }
});

// Refresh token route
router.post("/refresh", authMiddleware, async (req, res) => {
  let client;

  try {
    client = await connectToDatabase();
    const db = client.db("driveeasy");

    const userId = req.user.id;
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({
      token,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error("Error in /refresh endpoint:", error);
    res.status(500).json({ message: "Error refreshing token", error: error.message });
  } finally {
    client && client.close();
  }
});

module.exports = router;