const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
if (!process.env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN is not set. Check your .env file.");
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check route
const { query } = require("./db/query");

// Health check route (includes DB connectivity check)
app.get("/health", async (req, res, next) => {
  try {
    await query("SELECT 1 AS ok;");
    res.status(200).json({ status: "ok", db: "ok" });
  } catch (err) {
    next(err);
  }
});

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
