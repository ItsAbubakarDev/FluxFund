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

const Campaign = require("./models/Campaign");
const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Passport Setup
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Refresh Token:", refreshToken);
        console.log("Profile:", profile);

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            refreshToken: refreshToken,
          });
          await user.save();
        } else {
          if (refreshToken && user.refreshToken !== refreshToken) {
            user.refreshToken = refreshToken;
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Session Setup
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// OAuth2 client setup for Nodemailer (if needed)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// ===== ROUTES =====

// Google Auth Routes
passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.send"], // Add required scopes
  accessType: "offline",
  prompt: "consent",
})

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);

// Create a campaign
app.post("/api/campaigns", upload.single("photo"), async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const campaign = new Campaign({
      name,
      description,
      photoUrl,
      votes: 0,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    console.error("Failed to create campaign:", err);
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

// Group campaigns by tags
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
    console.error("Error grouping campaigns:", err);
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

// Signup user
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to FluxFund!",
      text: `Hi ${fullName},\n\nThank you for signing up for FluxFund. We're excited to have you on board!\n\nBest regards,\nThe FluxFund Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email:", error);
      } else {
        console.log("Welcome email sent:", info.response);
      }
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));