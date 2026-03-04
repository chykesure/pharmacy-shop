import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose"; // Added for direct access
import connectDB from "./src/config/db.js";
import indexRoutes from "./src/routes/index.js";
import User from "./src/models/User.js"; // Ensure this path is correct

dotenv.config();

const app = express();

// Connect to DB
connectDB();

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://komolafe-and-son.onrender.com",
    "https://plastic-industry.onrender.com" // Added your backend URL just in case
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- THE CORRECT SEED ROUTE ---
// Access this at: https://plastic-industry.onrender.com/init-db
app.get("/init-db", async (req, res) => {
  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ username: "chuks" });
    if (userExists) {
      return res.send("<h1>Database already initialized!</h1><p>User 'chuks' already exists. Log in normally.</p>");
    }

    // 2. Create the first Admin
    const admin = new User({
      username: "chuks",
      email: "chuks@test.com",
      password: "0000", 
      role: "Admin",
      status: "Active"
    });

    await admin.save();
    
    res.send("<h1>Success!</h1><p>User 'chuks' created with password '0000'. Your Atlas collections are now visible!</p>");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
});

// Root Test Route
app.get("/", (req, res) => res.send("Pharmacy Server backend is running 🚀"));

// Mount all other routes
app.use(indexRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});