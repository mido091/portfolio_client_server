const db = require("../config/db");

// helper: update partial بدون ما تمسح القديم
const get = (newVal, oldVal) => (newVal !== undefined ? newVal : oldVal);

exports.create = async (req, res) => {
  try {
    const b = req.body || {};

    // الفورم بتاعك بيبعت name مش full_name
    const row = {
      full_name: b.name ?? null,
      email: b.email ?? null,
      phone: b.phone ?? null,
      subject: b.subject ?? null,
      message: b.message ?? null,

      // optional meta (لو مش عايزهم شيلهم من الجدول/الـ insert)
      ip_address: req.ip ?? null,
      user_agent: req.headers["user-agent"] ?? null,
    };

    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(",");
    const values = cols.map((k) => row[k]);

    const sql = `INSERT INTO contact_messages (${cols.join(",")}) VALUES (${placeholders})`;
    const [result] = await db.query(sql, values);

    res.status(201).json({ message: "Message sent", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.status(200).json({ page, limit, data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM contact_messages WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Message not found" });

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};

    const [existingRows] = await db.query(
      `SELECT * FROM contact_messages WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!existingRows.length) return res.status(404).json({ message: "Message not found" });

    const existing = existingRows[0];

    const row = {
      full_name: get(b.name, existing.full_name) ?? null,
      email: get(b.email, existing.email) ?? null,
      phone: get(b.phone, existing.phone) ?? null,
      subject: get(b.subject, existing.subject) ?? null,
      message: get(b.message, existing.message) ?? null,
    };

    const cols = Object.keys(row);
    const setClause = cols.map((c) => `${c}=?`).join(", ");
    const values = cols.map((k) => row[k]);

    const sql = `UPDATE contact_messages SET ${setClause} WHERE id = ?`;
    const [result] = await db.query(sql, [...values, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`DELETE FROM contact_messages WHERE id = ?`, [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
