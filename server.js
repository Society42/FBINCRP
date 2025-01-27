const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = "https://ncrpfbi.com/forum.html";

// Middleware
app.use(cors({ origin: "https://ncrpfbi.com", credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/auth/discord", (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});

app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) return res.status(400).send("No code provided");

    try {
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = userResponse.data;

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("authToken", token, { httpOnly: true, secure: true, sameSite: "strict" });
        res.redirect("/forum.html");
    } catch (error) {
        console.error("OAuth2 Error:", error.response?.data || error.message);
        res.status(500).send("Authentication failed");
    }
});

app.get("/auth/verify", (req, res) => {
    const token = req.cookies.authToken;

    if (!token) return res.status(401).json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ loggedIn: true, user: decoded });
    } catch {
        res.status(401).json({ loggedIn: false });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));