const express = require("express");

const { query } = require("../db/query");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * All playlist routes are user-owned and require auth.
 */
router.use(requireAuth);

const ALLOWED_LINK_TYPES = new Set([
  "tiktok",
  "instagram",
  "webpage",
  "youtube",
]);

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function assertPlaylistOwnedByUser(playlistId, userId) {
  const result = await query(
    `SELECT id FROM playlists WHERE id = $1 AND user_id = $2;`,
    [playlistId, userId],
  );
  return result.rows.length > 0;
}

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
      [userId],
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
      [userId, String(title).trim(), description || null],
    );

    return res.status(201).json({ playlist: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /playlists/:id
 * Returns a single playlist + its links if owned by the current user.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const playlistId = Number(req.params.id);

    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist id" });
    }

    const playlistResult = await query(
      `
      SELECT id, user_id, title, description, created_at
      FROM playlists
      WHERE id = $1 AND user_id = $2;
      `,
      [playlistId, userId],
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const linksResult = await query(
      `
      SELECT id, playlist_id, url, link_type, title, note, created_at
      FROM playlist_links
      WHERE playlist_id = $1
      ORDER BY created_at DESC;
      `,
      [playlistId],
    );

    return res.status(200).json({
      playlist: playlistResult.rows[0],
      links: linksResult.rows,
    });
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
      ],
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
      [playlistId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /playlists/:id/links
 * Body: { url, linkType, title?, note? }
 * Adds an external link to a playlist if owned by the current user.
 */
router.post("/:id/links", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const playlistId = Number(req.params.id);

    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist id" });
    }

    const owned = await assertPlaylistOwnedByUser(playlistId, userId);
    if (!owned) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const { url, linkType, title, note } = req.body;

    if (!url || !isValidHttpUrl(String(url).trim())) {
      return res
        .status(400)
        .json({ error: "A valid http/https url is required" });
    }

    if (!linkType || !ALLOWED_LINK_TYPES.has(String(linkType).trim())) {
      return res.status(400).json({
        error: "Invalid linkType",
        allowed: Array.from(ALLOWED_LINK_TYPES),
      });
    }

    const result = await query(
      `
      INSERT INTO playlist_links (playlist_id, url, link_type, title, note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, playlist_id, url, link_type, title, note, created_at;
      `,
      [
        playlistId,
        String(url).trim(),
        String(linkType).trim(),
        title ? String(title).trim() : null,
        note ? String(note).trim() : null,
      ],
    );

    return res.status(201).json({ link: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /playlists/:id/links/:linkId
 * Deletes a link from a playlist if owned by the current user.
 */
router.delete("/:id/links/:linkId", async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const playlistId = Number(req.params.id);
    const linkId = Number(req.params.linkId);

    if (!Number.isInteger(playlistId) || !Number.isInteger(linkId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const owned = await assertPlaylistOwnedByUser(playlistId, userId);
    if (!owned) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const result = await query(
      `
      DELETE FROM playlist_links
      WHERE id = $1 AND playlist_id = $2
      RETURNING id;
      `,
      [linkId, playlistId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Link not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
