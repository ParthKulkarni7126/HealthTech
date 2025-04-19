const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticate = require("../middleware/auth");
const checkRole = require("../middleware/role");

// ✅ POST: Add prescription (Doctor only)
router.post("/", authenticate, checkRole("doctor"), async (req, res) => {
  const { patient_id, medication, dosage, instructions } = req.body;

  if (!patient_id || !medication || !dosage) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, instructions)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patient_id, req.user.id, medication, dosage, instructions]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding prescription:", err.message);
    res.status(500).send("Server error");
  }
});

// ✅ GET: Fetch prescriptions by patient ID
router.get("/:patientId", authenticate, async (req, res) => {
  const { patientId } = req.params;
  const requester = req.user;

  // Only patient themself or a doctor can access
  if (
    requester.role !== "doctor" &&
    !(requester.role === "patient" && parseInt(patientId) === requester.id)
  ) {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY issued_date DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching prescriptions:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
