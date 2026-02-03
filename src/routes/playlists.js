const express = require("express");

const { query } = require("../db/query");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * All playlist routes are user-owned and require auth.
 */
router.use(requireAuth);

/**
 * GET /playlists
 * Returns all playlists for the current user.
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT id, user_id, title, description, created_at
      FROM playlists
      WHERE user_id = $1
      ORDER BY created_at DESC;
      `,
      [userId]
    );

    return res.status(200).json({ playlists: result.rows });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /playlists
 * Body: { title, description? }
 * Creates a playlist for the current user.
 */
router.post("/", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, description } = req.body;

    if (!title || String(title).trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await query(
      `
      INSERT INTO playlists (user_id, title, description)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, title, description, created_at;
      `,
      [userId, String(title).trim(), description || null]
    );

    return res.status(201).json({ playlist: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /playlists/:id
 * Returns a single playlist if owned by the current user.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const playlistId = Number(req.params.id);

    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist id" });
    }

    const result = await query(
      `
      SELECT id, user_id, title, description, created_at
      FROM playlists
      WHERE id = $1 AND user_id = $2;
      `,
      [playlistId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(200).json({ playlist: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /playlists/:id
 * Body: { title?, description? }
 * Updates a playlist if owned by the current user.
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const playlistId = Number(req.params.id);

    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist id" });
    }

    const { title, description } = req.body;

    const hasTitle = typeof title !== "undefined";
    const hasDescription = typeof description !== "undefined";

    if (!hasTitle && !hasDescription) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (hasTitle && String(title).trim().length === 0) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    const result = await query(
      `
      UPDATE playlists
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description)
      WHERE id = $3 AND user_id = $4
      RETURNING id, user_id, title, description, created_at;
      `,
      [
        hasTitle ? String(title).trim() : null,
        hasDescription ? (description === null ? null : description) : null,
        playlistId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(200).json({ playlist: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /playlists/:id
 * Deletes a playlist if owned by the current user.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const playlistId = Number(req.params.id);

    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist id" });
    }

    const result = await query(
      `
      DELETE FROM playlists
      WHERE id = $1 AND user_id = $2
      RETURNING id;
      `,
      [playlistId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
