// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Optional dotenv for environment variables
try {
  require("dotenv").config();
} catch (err) {
  console.warn("dotenv package not found, skipping loading .env");
}

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/loginSystem";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/loginSystem")
  .then(() => console.log("🟢 MongoDB connected"))
  .catch((err) => {
    console.error("🔴 MongoDB connection error:", err);
    process.exit(1);
  });

// Import routes
const authRoutes  = require("./routes/auth");
const adminRoutes = require("./routes/admin");

// Uncomment below only when these route files are ready and exist
// const facultyRoutes = require("./routes/faculty");
// const studentRoutes = require("./routes/student");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Only mount these if route files exist; else comment them out
// app.use("/api/faculty", facultyRoutes);
// app.use("/api/student", studentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
