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

// 🧠 Utility: Check if roll number is within a given range string
function isRollInRange(rollno, rangeStr) {
  const [start, end] = rangeStr.split("–").map(r => r.trim().toUpperCase());
  return start <= rollno && rollno <= end;
}

// 🧠 Utility: Check if roll number is in any of the rollNumber ranges
function matchRollNumber(rollno, rollNumbersArray) {
  return rollNumbersArray?.some(rangeStr => isRollInRange(rollno, rangeStr));
}

// ✅ Student Login + Return All Allocations if Matched
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

    // 🔄 Find all matching allocations
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

// ✅ GET All Allocations by Roll Number (returns array)
app.get("/api/allocation/:rollno", async (req, res) => {
  const roll = req.params.rollno.trim().toUpperCase();

  try {
    const allocations = await Allocation.find({});
    const matched = allocations.filter(a => matchRollNumber(roll, a.rollNumbers));

    if (matched.length > 0) {
      res.status(200).json(matched); // ✅ Return array
    } else {
      res.status(404).json({ message: "No allocation found" });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Save Allocations (used by RoomAllocator frontend)
app.post("/api/save-allocations", async (req, res) => {
  try {
   
    await Allocation.insertMany(req.body.allocations);
    res.status(200).json({ message: "Allocations saved" });
  } catch (err) {
    console.error("Saving allocations error:", err);
    res.status(500).json({ message: "Failed to save allocations" });
  }
});

// ✅ API Health Check
app.get("/", (req, res) => {
  res.send("🚀 Student Room Allocation API is running");
});

app.listen(PORT, () => {
  console.log(`🔵 Server running at http://localhost:${PORT}`);
});
