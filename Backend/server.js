const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");

const Campaign = require("./models/Campaign");
const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
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

// Passport configuration
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.send"
  ],
  access_type: "offline",
  prompt: "consent"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: profile.id },
      {
        $set: {
          fullName: profile.displayName,
          email: profile.emails[0].value,
          refreshToken: refreshToken
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
    return done(null, user);
  } catch (err) {
    console.error("Google auth error:", err);
    return done(err, null, { message: "Google authentication failed" });
  }
}));

// Session configuration
app.use(session({
  secret: "dev-only-unsafe-secret", // Simple key for local development
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Disable HTTPS-only in dev
    sameSite: "lax" 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Email OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

// Token refresh listener (NEW)
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log("New refresh token:", tokens.refresh_token);
    // Store the new refresh token in your database if needed
  }
  console.log("New access token:", tokens.access_token);
});

// Routes
app.get("/auth/google", passport.authenticate("google"));

app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send("Authorization code not found");

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
    console.log("Expiry Date:", tokens.expiry_date);

    res.send("Authorization successful. You can close this tab.");
  } catch (err) {
    console.error("Error retrieving tokens:", err);
    res.status(500).send("Failed to get tokens");
  }
});

// Campaign:
// Create campaign (NEW)
app.post("/api/campaigns", upload.single("photo"), async (req, res) => {
  try {
    console.log("Received files:", req.file); // Debug file upload
    console.log("Received body:", req.body); // Debug other fields

    // Validate required fields
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    // Process tags into array
    const tags = req.body.tags 
      ? req.body.tags.split(',').map(tag => tag.trim())
      : [];

    const newCampaign = new Campaign({
      name: req.body.name,
      description: req.body.description,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      tags: tags,
      votes: 0,
      voters: [],
      createdAt: new Date()
    });

    const savedCampaign = await newCampaign.save();
    console.log("Saved campaign:", savedCampaign); // Debug

    res.status(201).json(savedCampaign);
  } catch (err) {
    console.error("Campaign creation error:", err);
    
    // Cleanup uploaded file if save failed
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: "Failed to create campaign",
      details: err.message 
    });
  }
});

// Create campaign
app.post("/api/campaigns/:id/vote", async (req, res) => {
  try {
    const { rating, userId } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // Check if user already voted
    const existingVote = campaign.voters.find(v => v.userId === userId);
    let voteChange = 0;

    if (existingVote) {
      // User changing vote
      voteChange = rating - existingVote.rating;
      existingVote.rating = rating;
    } else {
      // New vote
      voteChange = rating;
      campaign.voters.push({ userId, rating });
    }

    campaign.votes += voteChange;
    await campaign.save();
    
    res.json({
      success: true,
      newVotes: campaign.votes,
      userVote: rating
    });
  } catch (err) {
    res.status(500).json({ error: "Voting failed", details: err.message });
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

// Signup route with welcome email (UPDATED)
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log("Signup request body:", req.body);

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newUser = await new User({ fullName, email, password: hashedPassword }).save();

    // In server.js, replace the transporter with:
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `FluxFund Team <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to FluxFund! 🚀",
      html: `<p>Hi ${fullName},</p><p>Welcome to our platform!</p>`
    });

    res.status(201).json({
      message: "User registered successfully",
      redirectUrl: "http://localhost:5173/"
    });

  } catch (err) {
    console.error("Full error details:", err);
    res.status(500).json({ 
      error: "Signup failed",
      details: err.message 
    });
  }
});

// User wallet linking endpoint
app.patch('/api/users/:id/wallet', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { walletAddress: req.body.walletAddress },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Enhanced login endpoint
app.post("/api/login", async (req, res) => {
  console.log("[BACKEND] Login request received:", req.body.email); // Add this

  try {
    const user = await User.findOne({ email: req.body.email });
    console.log("[BACKEND] User found:", user?._id); // Add this

    if (!user) {
      console.log("[BACKEND] No user found for email:", req.body.email); // Add this
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(req.body.password, user.password);
    console.log("[BACKEND] Password validation result:", isValid); // Add this

    if (!isValid) {
      console.log("[BACKEND] Invalid password for user:", user._id); // Add this
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log("[BACKEND] Generated token for user:", user._id); // Add this

    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        walletAddress: user.walletAddress
      }
    });

  } catch (err) {
    console.error("[BACKEND] Login processing error:", {
      error: err,
      stack: err.stack,
      body: req.body
    }); // Add this
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
