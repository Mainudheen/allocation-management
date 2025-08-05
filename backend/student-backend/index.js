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

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Check if a roll number lies between rollStart and rollEnd
function isRollInRange(rollno, start, end) {
  return rollno.localeCompare(start) >= 0 && rollno.localeCompare(end) <= 0;
}

<<<<<<< HEAD
// 🔁 Check if a roll number matches the range
function matchRollNumber(rollno, rollNumbers) {
  return isRollInRange(rollno, rollNumbers);
}

// ✅ Student Login: returns all matched allocations
=======
// ✅ Student Login: Returns matching allocations
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
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
    const matched = allocations.filter(a =>
      a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );

    res.status(200).json({
      message: "Login successful",
      student,
      allocations: matched
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

<<<<<<< HEAD
// ✅ Fetch All Allocations
app.get("/api/allocations", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allocations = await Allocation.find({ examDate: { $gte: today } });
    res.status(200).json(allocations);
  } catch (err) {
    console.error("Fetch allocations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch All Allocations by Roll Number
=======
// ✅ Fetch allocations for a roll number
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
app.get("/api/allocation/:rollno", async (req, res) => {
  const roll = req.params.rollno.trim().toUpperCase();

  try {
    const allocations = await Allocation.find({});
    const matched = allocations.filter(a =>
      a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );

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

// ✅ Save Allocations with expiry date (3 days after examDate)
app.post("/api/save-allocations", async (req, res) => {
  try {
    const allocationsWithExpiry = req.body.allocations.map(allocation => ({
      ...allocation,
      examName: allocation.subjectWithCode, // Map subjectWithCode to examName
      expiryDate: new Date(new Date(allocation.examDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    }));

    await Allocation.insertMany(allocationsWithExpiry);
    res.status(200).json({ message: "Allocations saved with expiry" });
  } catch (err) {
    console.error("Saving allocations error:", err);
    res.status(500).json({ message: "Failed to save allocations" });
  }
});

<<<<<<< HEAD
// ✅ Update Allocation by ID
app.put("/api/allocation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = {
      ...req.body,
      examName: req.body.subjectWithCode, // Map subjectWithCode to examName
      expiryDate: new Date(new Date(req.body.examDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    };

    const updatedAllocation = await Allocation.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedAllocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.status(200).json({ message: "Allocation updated successfully", allocation: updatedAllocation });
  } catch (err) {
    console.error("Update allocation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Health Check
=======
// ✅ Health check route
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
app.get("/", (req, res) => {
  res.send("🚀 Student Room Allocation API is running");
});

app.listen(PORT, () => {
  console.log(`🔵 Server running at http://localhost:${PORT}`);
});