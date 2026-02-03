const express = require("express");
const bcrypt = require("bcrypt");

const { query } = require("../db/query");
const { createToken } = require("../utils/auth");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * POST /auth/register
 * Body: { email, password, name? }
 * Creates a user and returns { token, user }
 */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await query("SELECT id FROM users WHERE email = $1;", [
      normalizedEmail,
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at;
      `,
      [normalizedEmail, passwordHash, name || null]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns { token, user }
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await query(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1;",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userRow = result.rows[0];
    const matches = await bcrypt.compare(password, userRow.password_hash);

    if (!matches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = { id: userRow.id, email: userRow.email, name: userRow.name };
    const token = createToken(user);

    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /auth/me
 * Protected
 * Returns current user profile
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1;",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
