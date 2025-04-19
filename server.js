// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Only load dotenv once

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));                          // 🔐 Auth (Register/Login)
app.use("/api/patient", require("./routes/patient"));                    // 👤 Patient Routes
app.use("/api/doctor", require("./routes/doctor"));                      // 👨‍⚕️ Doctor Routes
app.use("/api/appointments", require("./routes/appointments"));          // 📅 Appointments
app.use("/api/medical_records", require("./routes/medicalRecords"));     // 🏥 Medical Records
app.use("/api/prescriptions", require("./routes/prescriptions"));        // 💊 Prescriptions
app.use("/api/chatbot", require("./routes/chatbot"));                    // 🤖 AI Chatbot Route ✅

app.get("/", (req, res) => {
  res.send("🚀 HealthTech Backend is Live");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Unexpected error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
