const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const pool = require("../db");

// 👤 Patient Dashboard - Protected by JWT + Role
router.get("/dashboard", auth, role(["patient"]), (req, res) => {
  res.json({
    message: "Welcome to the patient dashboard!",
    user: req.user,
  });
});

// ✅ Patient Accepts Approved Appointment
// PUT /api/patient/appointments/:id/accept
router.put("/appointments/:id/accept", auth, role(["patient"]), async (req, res) => {
  const appointmentId = req.params.id;

  try {
    // Check if the appointment exists and belongs to the current patient
    const appointmentResult = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND patient_id = $2",
      [appointmentId, req.user.id]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found or does not belong to you." });
    }

    const appointment = appointmentResult.rows[0];

    // Check if doctor has approved the appointment
    if (appointment.status !== "approved") {
      return res.status(400).json({ message: "Appointment must be approved by doctor before accepting." });
    }

    // Update appointment status to accepted
    await pool.query(
      "UPDATE appointments SET status = 'accepted' WHERE id = $1",
      [appointmentId]
    );

    res.json({ message: "Appointment accepted successfully." });
  } catch (err) {
    console.error("Error accepting appointment:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
