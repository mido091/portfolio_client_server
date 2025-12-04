const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    return res
      .status(200)
      .json({ message: "Users retrieved successfully", users: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// register user
exports.registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!role) {
      role = "user";
    }
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//login user
exports.loginUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if ((!email && !name) || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const [rows2] = await db.query("SELECT * FROM users WHERE username = ?", [
      name,
    ]);

    if (rows.length === 0 && rows2.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const user = rows.length > 0 ? rows[0] : rows2[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, name: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return res.status(200).json({
      message: "Login successful",
      username: user.username,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const id = req.params.id;
    const query =
      "UPDATE users SET username = ? , email = ? , password = ? , role = ? WHERE id = ?";

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(query, [
      name,
      email,
      hashedPassword,
      role,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete user
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000);
    const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: 5 * 60,
    });
    // إرسال OTP على الإيميل
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
return res.status(200).json({ message: "OTP sent successfully", token });


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, code, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, otp } = decoded;
    if (otp != code) return res.status(400).json({ msg: "Invalid OTP" });
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "OTP expired" });
    }
    res.status(500).json({ message: err.message });
  }
};