const bcrypt = require("bcrypt"); // or "bcryptjs" if you're using that
const jwt = require("jsonwebtoken");
const pool = require("../db");

// 📝 Helper function to exclude sensitive data
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// 🧾 REGISTER Controller
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic input validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [name, email, hashedPassword, role.toLowerCase()]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(newUser.rows[0]),
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).send("Server error");
  }
};

// 🔐 LOGIN Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic input check
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).send("Server error");
  }
};