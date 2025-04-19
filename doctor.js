// routes/doctor.js

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const pool = require("../db");

// 👨‍⚕️ Doctor Dashboard - Protected by JWT + Role
router.get("/dashboard", auth, role(["doctor"]), (req, res) => {
  res.json({
    message: "Welcome to the doctor dashboard!",
    user: req.user,
  });
});

// ✅ PUT /api/doctor/appointments/:id/approve
router.put("/appointments/:id/approve", auth, role(["doctor"]), async (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body; // should be "approved" or "rejected"

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    // Check if appointment exists
    const appointment = await pool.query("SELECT * FROM appointments WHERE id = $1", [appointmentId]);
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update status
    await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [status, appointmentId]);

    res.json({ message: `Appointment ${status} successfully` });
  } catch (err) {
    console.error("Error approving/rejecting appointment:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
