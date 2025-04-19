const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../db");

// Book an appointment
router.post("/book", auth, async (req, res) => {
  const { doctor_id, appointment_date, reason } = req.body;
  const patient_id = req.user.id;

  try {
    const doctor = await pool.query("SELECT * FROM users WHERE id = $1 AND role = 'doctor'", [doctor_id]);
    if (doctor.rows.length === 0) {
      return res.status(400).json({ message: "Doctor not found or not valid." });
    }

    const newAppointment = await pool.query(
      "INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES ($1, $2, $3, $4) RETURNING *",
      [patient_id, doctor_id, appointment_date, reason]
    );

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: newAppointment.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error booking appointment" });
  }
});

module.exports = router;
