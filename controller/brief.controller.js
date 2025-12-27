const db = require("../config/db");

// يحوّل arrays لـ JSON string للتخزين (أو يرجع null)
function toJsonString(value) {
  if (value == null) return null;

  if (Array.isArray(value)) return JSON.stringify(value);

  // لو جايلك من FormData كـ string
  if (typeof value === "string") {
    // حاول parse JSON
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch {
      // fallback: comma-separated
      if (value.includes(",")) {
        return JSON.stringify(
          value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }
      // single value
      return JSON.stringify([value]);
    }
  }

  return JSON.stringify([value]);
}

// ✅ جديد: يجيب اللوجوهات من req.files (Cloudinary middleware)
function pickLogosFromFiles(files) {
  if (!files) return null;

  const arr = Array.isArray(files) ? files : [files];

  const urls = arr
    .map((f) => f.secure_url || f.url || f.path || f.location)
    .filter(Boolean);

  if (!urls.length) return null;

  return {
    logo_1: urls[0] ?? null,
    logo_2: urls[1] ?? null,
    logo_3: urls[2] ?? null,
    logo_4: urls[3] ?? null,
    logo_5: urls[4] ?? null,
  };
}

// يستقبل logos كـ array URLs أو أعمدة logo_1..logo_5 (من body)
function pickLogos(body) {
  if (Array.isArray(body.logos)) {
    return {
      logo_1: body.logos[0] ?? null,
      logo_2: body.logos[1] ?? null,
      logo_3: body.logos[2] ?? null,
      logo_4: body.logos[3] ?? null,
      logo_5: body.logos[4] ?? null,
    };
  }

  return {
    logo_1: body.logo_1 ?? null,
    logo_2: body.logo_2 ?? null,
    logo_3: body.logo_3 ?? null,
    logo_4: body.logo_4 ?? null,
    logo_5: body.logo_5 ?? null,
  };
}

function mapBodyToRow(body, existingRow = null, logosOverride = null) {
  const logos = logosOverride || pickLogos(body);

  // لو Update جزئي: fallback للقديم
  const get = (newVal, oldVal) => (newVal !== undefined ? newVal : oldVal);

  return {
    full_name: get(body.fullName, existingRow?.full_name) ?? null,
    website: get(body.website, existingRow?.website) ?? null,
    phone: get(body.phone, existingRow?.phone) ?? null,
    email: get(body.email, existingRow?.email) ?? null,

    social_facebook: get(body.social1, existingRow?.social_facebook) ?? null,
    social_instagram: get(body.social2, existingRow?.social_instagram) ?? null,
    social_twitter: get(body.social3, existingRow?.social_twitter) ?? null,

    logo_name: get(body.logoName, existingRow?.logo_name) ?? null,

    company_field: get(body.companyField, existingRow?.company_field) ?? null,
    project_goals: get(body.goals, existingRow?.project_goals) ?? null,
    slogan: get(body.slogan, existingRow?.slogan) ?? null,
    name_details: get(body.nameDetails, existingRow?.name_details) ?? null,
    competitors: get(body.competitors, existingRow?.competitors) ?? null,
    design_references:
      get(body.references, existingRow?.design_references) ?? null,

    project_name: get(body.projectName, existingRow?.project_name) ?? null,
    project_type: get(body.projectType, existingRow?.project_type) ?? null,
    project_type_other:
      get(body.projectTypeOther, existingRow?.project_type_other) ?? null,

    target_audience:
      body.audience !== undefined
        ? toJsonString(body.audience)
        : existingRow?.target_audience ?? null,

    logo_type: get(body.logoType, existingRow?.logo_type) ?? null,

    favorite_colors:
      get(body.favoriteColors, existingRow?.favorite_colors) ?? null,
    about_project: get(body.aboutProject, existingRow?.about_project) ?? null,

    logo_1: get(logos.logo_1, existingRow?.logo_1) ?? null,
    logo_2: get(logos.logo_2, existingRow?.logo_2) ?? null,
    logo_3: get(logos.logo_3, existingRow?.logo_3) ?? null,
    logo_4: get(logos.logo_4, existingRow?.logo_4) ?? null,
    logo_5: get(logos.logo_5, existingRow?.logo_5) ?? null,

    applications:
      body.applications !== undefined
        ? toJsonString(body.applications)
        : existingRow?.applications ?? null,

    deadline: get(body.deadline, existingRow?.deadline) ?? null,
    budget: get(body.budget, existingRow?.budget) ?? null,
  };
}

exports.create = async (req, res) => {
  try {
    // ✅ هنا التعديل الوحيد: خد الصور من Cloudinary middleware
    // لو انت مستخدم upload.array('logos') => req.files
    // لو upload.fields => ممكن req.files.logos
    const files =
      req.files?.logos || req.files || req.file || null;

    const logosFromFiles = pickLogosFromFiles(files);

    const row = mapBodyToRow(req.body, null, logosFromFiles);

    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(",");
    const values = cols.map((k) => row[k]);

    const sql = `INSERT INTO brief (${cols.join(",")}) VALUES (${placeholders})`;
    const [result] = await db.query(sql, values);

    res.status(201).json({ message: "Brief created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100
    );
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      "SELECT * FROM brief ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
    const [rows] = await db.query("SELECT * FROM brief WHERE id = ? LIMIT 1", [
      id,
    ]);

    if (!rows.length) return res.status(404).json({ message: "Brief not found" });

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRows] = await db.query(
      "SELECT * FROM brief WHERE id = ? LIMIT 1",
      [id]
    );
    if (!existingRows.length)
      return res.status(404).json({ message: "Brief not found" });

    // ✅ هنا التعديل الوحيد: لو فيه صور جديدة من Cloudinary استخدمها، غير كده احتفظ بالقديم
    const files =
      req.files?.logos || req.files || req.file || null;

    const logosFromFiles = pickLogosFromFiles(files);

    const row = mapBodyToRow(req.body, existingRows[0], logosFromFiles);

    const cols = Object.keys(row);
    const setClause = cols.map((c) => `${c}=?`).join(", ");
    const values = cols.map((k) => row[k]);

    const sql = `UPDATE brief SET ${setClause} WHERE id = ?`;
    const [result] = await db.query(sql, [...values, id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Brief not found" });

    res.status(200).json({ message: "Brief updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM brief WHERE id = ?", [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Brief not found" });

    res.status(200).json({ message: "Brief deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
