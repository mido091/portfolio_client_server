const db = require("../config/db");

//get all plogs
exports.getAllPlogs = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM plogs");
    return res
      .status(200)
      .json({ message: "Plogs retrieved successfully", plogs: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get plog by id
exports.getPlogById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM plogs WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Plog not found" });
    }
    return res
      .status(200)
      .json({ message: "Plog retrieved successfully", plog: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//create plog
exports.createPlog = async (req, res) => {
  try {
    const { header, title, description, footer , category } = req.body;
    if (!header || !title || !description || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //image
    const image = req.file;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }
    const filePath = image.path;

    const [result] = await db.query(
      "INSERT INTO plogs (header , title , image , description , footer , category ) VALUES ( ? , ? , ? , ? , ? , ? )",
      [header, title, filePath, description, footer , category]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Plog not created" });
    }
    return res
      .status(201)
      .json({ message: "Plog created successfully", plog: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update plog
exports.updatePlog = async (req, res) => {
  try {
    const { header, title, description, footer , category } = req.body;
    const id = req.params.id;
    const image = req.file;

    const [rows] = await db.query("SELECT image FROM plogs WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Plog not found" });
    }
    const currentImage = rows[0].image;
    const filePath = image ? image.path : currentImage;
    const query =
      "UPDATE plogs SET header = ? , title = ? , image = ? , description = ? , footer = ? , category = ? WHERE id = ?";
    const [result] = await db.query(query, [
      header,
      title,
      filePath,
      description,
      footer,
      category,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Plog not found" });
    }
    return res.status(200).json({ message: "Plog updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// delete plog
exports.deletePlog = async (req, res) => {
  try {
    const id = req.params.id;
    const query = "DELETE FROM plogs WHERE id = ?";
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Plog not found" });
    }
    return res.status(200).json({ message: "Plog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
