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

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add these lines for frontend serving
//---------------------------------------------------------------

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  });
} else {
  // Development root route
  app.get("/", (req, res) => {
    res.send("API running in development mode");
  });
}
//---------------------------------------------------------------

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

// Google OAuth Strategy (Updated with correct scopes)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile", // Full URI
        "https://www.googleapis.com/auth/userinfo.email",   // Full URI
        "https://www.googleapis.com/auth/gmail.send"        // Full URI
      ],
      accessType: "offline",
      prompt: "consent",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Refresh Token:", refreshToken);
        
        // Validate profile data exists
        if (!profile?.emails?.[0]?.value) {
          throw new Error("No email found in Google profile");
        }

        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            $set: {
              fullName: profile.displayName,
              email: profile.emails[0].value,
              refreshToken: refreshToken
            }
          },
          {
            upsert: true,
            new: true,
            runValidators: true 
          }
        );

        return done(null, user);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null, { message: "Google authentication failed" });
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

// OAuth2 client setup for Nodemailer
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

// Helper function to get transporter with fresh tokens
const getTransporter = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  
  if (!user || !user.refreshToken) {
    throw new Error("No refresh token available");
  }

  oauth2Client.setCredentials({
    refresh_token: user.refreshToken
  });

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      accessToken: await oauth2Client.getAccessToken(),
    },
  });
};

// ===== ROUTES =====

// Google Auth Routes (Updated with correct scope)
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.send"
    ],
    accessType: "offline",
    prompt: "consent"
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login", // Frontend login page
    successRedirect: "http://localhost:5173/dashboard", // Frontend dashboard
  })
);

// ... keep other routes the same until the signup route ...

// Signup user (Updated email sending)
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ 
      fullName, 
      email, 
      password: hashedPassword 
    });
    await newUser.save();

    // Email configuration using OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: await oauth2Client.getAccessToken() // Generate fresh access token
      },
    });

    // Send welcome email
    await transporter.sendMail({
      from: `FluxFund Team <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to FluxFund! 🚀",
      text: `Hi ${fullName},\n\nThank you for joining FluxFund.`,
      html: `<p>Hi ${fullName},</p><p>Welcome to our platform!</p>`
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ 
      error: err.response?.body?.error || "Signup failed" 
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));