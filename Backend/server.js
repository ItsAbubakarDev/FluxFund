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

    // Set credentials and force token refresh (UPDATED)
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Failed to generate access token");

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

// Token test endpoint (NEW)
app.get("/test-token", async (req, res) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    const { token } = await oauth2Client.getAccessToken();
    res.json({ 
      success: true,
      token: token 
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Token refresh failed",
      details: err.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))