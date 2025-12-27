// src/controllers/settings.controller.js
const db = require("../config/db");

// ✅ default settings (اختياري) — لو مش عايز reset شيله
const DEFAULT_SETTINGS = {
  site: {
    name: "Ahmed Kaoud",
    tagline: "Portfolio & Dashboard",
    logoText: "Ahmed",
    logoAccent: "Kaoud",
    description: "Professional portfolio and dashboard system",
  },
  colors: {
    primary: "#ff4500",
    dark: {
      background: "#1c1c1d",
      surface: "#333",
      surfaceAlt: "#3e3e3e",
      text: "#fff",
      textSecondary: "#000",
      mobile: "#363636",
      placeholder: "#afafaf",
    },
    light: {
      background: "#f2f2f2",
      surface: "#e5e5e5",
      surfaceAlt: "#e5e5e5",
      text: "#222",
      textSecondary: "#fff",
      mobile: "#eae6e6",
      placeholder: "#6b6b6b",
    },
  },
  theme: {
    default: "dark",
    allowToggle: true,
    persistPreference: true,
  },
  layout: {
    maxWidth: "1250px",
    containerPadding: "0 2rem",
  },
  animations: {
    transitionSpeed: "0.3s",
    hoverTransform: "translateY(-7px)",
    glowEffect: "0 0 0.7rem",
  },
  social: {
    facebook: "https://www.facebook.com/share/15nQ9gTgBS/",
    instagram:
      "https://www.instagram.com/a7medka3oud?igsh=MWt4ZjdmczA4czh6ag==",
    twitter: "https://x.com/a7medka3oud?t=_A5jmuHr7HmIzL0HLKx5Rg&s=09",
  },
};

// Deep merge بسيط للـ PATCH
function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
function deepMerge(target, source) {
  const out = { ...(target || {}) };
  for (const key of Object.keys(source || {})) {
    const a = out[key];
    const b = source[key];
    if (isObject(a) && isObject(b)) out[key] = deepMerge(a, b);
    else out[key] = b; // arrays & primitives => replace
  }
  return out;
}

async function ensureRowExists() {
  // بيضمن إن فيه row id=1 حتى لو DB فاضية
  await db.query(
    "INSERT INTO site_settings (id, settings) VALUES (1, ?) ON DUPLICATE KEY UPDATE id=id",
    [JSON.stringify(DEFAULT_SETTINGS)]
  );
}

exports.get = async (req, res) => {
  try {
    await ensureRowExists();

    const [rows] = await db.query(
      "SELECT settings, updated_at FROM site_settings WHERE id = 1 LIMIT 1"
    );

    const row = rows[0];
    // mysql2 ممكن يرجّع JSON كـ object أو string حسب config
    const settings =
      typeof row.settings === "string" ? JSON.parse(row.settings) : row.settings;

    res.status(200).json({
      settings,
      updated_at: row.updated_at,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT: replace بالكامل
exports.replace = async (req, res) => {
  try {
    const incoming = req.body;

    if (!incoming || typeof incoming !== "object") {
      return res.status(400).json({ message: "settings JSON is required" });
    }

    await ensureRowExists();

    await db.query("UPDATE site_settings SET settings = ? WHERE id = 1", [
      JSON.stringify(incoming),
    ]);

    res.status(200).json({ message: "Settings updated (replaced)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH: merge جزئي
exports.patch = async (req, res) => {
  try {
    const partial = req.body;

    if (!partial || typeof partial !== "object") {
      return res.status(400).json({ message: "partial settings JSON is required" });
    }

    await ensureRowExists();

    const [rows] = await db.query(
      "SELECT settings FROM site_settings WHERE id = 1 LIMIT 1"
    );

    const current =
      typeof rows[0].settings === "string"
        ? JSON.parse(rows[0].settings)
        : rows[0].settings;

    const merged = deepMerge(current, partial);

    await db.query("UPDATE site_settings SET settings = ? WHERE id = 1", [
      JSON.stringify(merged),
    ]);

    res.status(200).json({ message: "Settings updated (patched)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset (اختياري)
exports.reset = async (req, res) => {
  try {
    await db.query("UPDATE site_settings SET settings = ? WHERE id = 1", [
      JSON.stringify(DEFAULT_SETTINGS),
    ]);

    res.status(200).json({ message: "Settings reset to defaults" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
