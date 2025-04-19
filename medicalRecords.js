// routes/medicalRecords.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// ✅ GET all medical records for a doctor or patient (based on role)
router.get("/", auth, async (req, res) => {
  try {
    const user = req.user;

    let records;
    if (user.role === "doctor") {
      records = await pool.query(
        "SELECT * FROM medical_records WHERE doctor_id = $1",
        [user.id]
      );
    } else if (user.role === "patient") {
      records = await pool.query(
        "SELECT * FROM medical_records WHERE patient_id = $1",
        [user.id]
      );
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(records.rows);
  } catch (err) {
    console.error("Error fetching medical records:", err.message);
    res.status(500).send("Server error");
  }
});

// ✅ POST create a new medical record (only doctor can do this)
router.post("/", auth, role(["doctor"]), async (req, res) => {
  const { patient_id, diagnosis, treatment, notes } = req.body;

  try {
    const newRecord = await pool.query(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patient_id, req.user.id, diagnosis, treatment, notes]
    );

    res.status(201).json({
      message: "Medical record created successfully",
      record: newRecord.rows[0],
    });
  } catch (err) {
    console.error("Error creating medical record:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
