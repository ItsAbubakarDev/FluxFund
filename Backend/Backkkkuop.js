const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { google, Auth } = require("googleapis");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OAuth2Client } = require('google-auth-library');

const Campaign = require("./models/Campaign");
const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Frontend serving configuration
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API running in development mode");
  });
}

// File upload setup
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Google Auth Client
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Passport configuration
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// ===================== Routes =====================

// Google Sign-In Endpoint
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        googleId,
        email,
        fullName: name,
        avatar: picture,
        authMethod: "google"
      });
      await user.save();

      // Send welcome email
      await transporter.sendMail({
        from: `FluxFund Team <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to FluxFund! 🚀",
        html: `<p>Hi ${name},</p><p>Welcome to our platform via Google Sign-In!</p>`
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Google authentication error:', err);
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: err.message 
    });
  }
});

// Existing email signup route (modified for consistency)
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newUser = await new User({ 
      fullName, 
      email, 
      password: hashedPassword,
      authMethod: "email"
    }).save();

    await transporter.sendMail({
      from: `FluxFund Team <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to FluxFund! 🚀",
      html: `<p>Hi ${fullName},</p><p>Welcome to our platform!</p>`
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.fullName
      }
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Signup failed",
      details: err.message 
    });
  }
});

// ... [Keep all your existing campaign routes unchanged] ...
// Create campaign
app.post("/api/campaigns", upload.single("photo"), async (req, res) => {
  try {
    const campaign = new Campaign({
      name: req.body.name,
      description: req.body.description,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      votes: 0,
      tags: req.body.tags ? req.body.tags.split(",").map(tag => tag.trim()) : []
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

// Get all campaigns
app.get("/api/campaigns", async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// Group campaigns by tag
app.get("/api/campaigns/grouped", async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    const grouped = {};
    campaigns.forEach((campaign) => {
      campaign.tags.forEach((tag) => {
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(campaign);
      });
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: "Failed to group campaigns" });
  }
});

// Vote on a campaign
app.post("/api/campaigns/:id/vote", async (req, res) => {
  try {
    const { rating } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    campaign.votes += rating;
    await campaign.save();
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Voting failed" });
  }
});

// Top 8 campaigns
app.get("/api/campaigns/top8", async (req, res) => {
  try {
    const topCampaigns = await Campaign.find().sort({ votes: -1 }).limit(8);
    res.json(topCampaigns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top campaigns" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));