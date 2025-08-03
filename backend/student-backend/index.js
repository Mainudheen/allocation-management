const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");
const Allocation = require("./models/Allocation");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// 🔎 Check if a roll number is within a range
function isRollInRange(rollno, rangeStr) {
  const [start, end] = rangeStr.split("–").map(r => r.trim().toUpperCase());
  return start <= rollno && rollno <= end;
}

// 🔁 Check if a roll number matches any range
function matchRollNumber(rollno, rollNumbersArray) {
  return rollNumbersArray?.some(rangeStr => isRollInRange(rollno, rangeStr));
}

// ✅ Student Login: returns all matched allocations
app.post("/api/student-login", async (req, res) => {
  const { name, rollno, className, year, password } = req.body;

  try {
    const roll = rollno.trim().toUpperCase();

    const student = await Student.findOne({
      rollno: roll,
      className: className.trim().toUpperCase(),
      password: password.trim(),
      year: year.trim(),
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const allocations = await Allocation.find({});
    const matched = allocations.filter(a => matchRollNumber(roll, a.rollNumbers));

    res.status(200).json({
      message: "Login successful",
      student,
      allocations: matched || []
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch All Allocations by Roll Number (array)
app.get("/api/allocation/:rollno", async (req, res) => {
  const roll = req.params.rollno.trim().toUpperCase();

  try {
    const allocations = await Allocation.find({});
    const matched = allocations.filter(a => matchRollNumber(roll, a.rollNumbers));

    if (matched.length > 0) {
      res.status(200).json(matched);
    } else {
      res.status(404).json({ message: "No allocation found" });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Save Allocations with TTL expiry (3 days after examDate)
app.post("/api/save-allocations", async (req, res) => {
  try {
    const allocationsWithExpiry = req.body.allocations.map(allocation => ({
      ...allocation,
      expiryDate: new Date(new Date(allocation.examDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    }));

    await Allocation.insertMany(allocationsWithExpiry);
    res.status(200).json({ message: "Allocations saved with expiry" });
  } catch (err) {
    console.error("Saving allocations error:", err);
    res.status(500).json({ message: "Failed to save allocations" });
  }
});

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 Student Room Allocation API is running");
});

app.listen(PORT, () => {
  console.log(`🔵 Server running at http://localhost:${PORT}`);
});
