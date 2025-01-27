const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = 3000;
const JWT_SECRET = "your_jwt_secret"; 
const DISCORD_CLIENT_ID = "1333138927736983632";
const DISCORD_CLIENT_SECRET = "k58VF5C4LsAo1dOePNc1uuOhBd5nDq0O";
const REDIRECT_URI = "https://ncrpfbi.com/forum.html";

// Middleware
app.use(cors({ origin: "http://localhost:5500", credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes

// Discord OAuth2 Login URL
app.get("/auth/discord", (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});

// OAuth2 Callback
app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("No code provided");
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Get user information
        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = userResponse.data;

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

        // Set cookie
        res.cookie("authToken", token, { httpOnly: true });
        res.redirect("/forum.html"); // Redirect to forum page
    } catch (error) {
        console.error("OAuth2 Error:", error.response?.data || error.message);
        res.status(500).send("Authentication failed");
    }
});

// Verify Token
app.get("/auth/verify", (req, res) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ loggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ loggedIn: true, user: decoded });
    } catch {
        res.status(401).json({ loggedIn: false });
    }
});

// Fallback route for undefined endpoints
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));