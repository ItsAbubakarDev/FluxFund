const { google } = require("googleapis");
const open = require("open").default;
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config({ path: '.env' });  // Add this line

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,  // Now properly loaded
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

// Updated scopes to match server.js requirements
const scopes = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
  include_granted_scopes: true  // Added for better permission handling
});

console.log("Authorize this app by visiting this url:", url);
open(url);

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Enter the code from that page here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken({
      code: code.trim(),
      redirect_uri: 'http://localhost:5000/auth/google/callback',
    });

    // Important: Verify we got a refresh token
    if (!tokens.refresh_token) {
      throw new Error("No refresh token received. Make sure to use access_type='offline' and prompt='consent'");
    }

    console.log("\n=== IMPORTANT ===");
    console.log("Add these to your .env file:");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\nAccess Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
    console.log("Expiry Date:", new Date(tokens.expiry_date).toLocaleString());
    console.log("Scopes Granted:", tokens.scope);

    // Verify the token has email sending permissions
    if (!tokens.scope.includes("https://www.googleapis.com/auth/gmail.send")) {
      console.warn("\n Warning: Gmail send permission not granted!");
    }
  } catch (err) {
    console.error("\n Error retrieving tokens:");
    console.error(err.response?.data || err.message);
    
    // Specific troubleshooting tips
    if (err.message.includes("invalid_grant")) {
      console.log("\nTroubleshooting:");
      console.log("1. Try generating a new code (current one may be expired)");
      console.log("2. Make sure you're logged in with the correct Google account");
      console.log("3. Verify redirect_uri matches Google Cloud Console");
    }
  } finally {
    readline.close();
    process.exit();
  }
});