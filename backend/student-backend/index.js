const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Room = require("./models/Room");


require("dotenv").config();

const Student = require("./models/Student");
const Allocation = require("./models/Allocation");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const roomRoutes = require('./routes/roomRoutes'); // ✅ Move this here
app.use('/api/rooms', roomRoutes);

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





// ✅ Student Login: Returns matching allocations
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

// ✅ Fetch allocations for a roll number
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
      expiryDate: new Date(new Date(allocation.examDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    }));

    await Allocation.insertMany(allocationsWithExpiry);
    res.status(200).json({ message: "Allocations saved with expiry" });
  } catch (err) {
    console.error("Saving allocations error:", err);
    res.status(500).json({ message: "Failed to save allocations" });
  }
});
//this code is only for Manage-allotments
// ✅ Fetch all current (non-expired) allocations
app.get("/api/allocations", async (req, res) => {
  try {
    const now = new Date();
    const allocations = await Allocation.find({ expiryDate: { $gte: now } });
    res.status(200).json(allocations);
  } catch (err) {
    console.error("Fetch all allocations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.put("/api/allocation/:id", async (req, res) => {
  try {
    const updated = await Allocation.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update allocation" });
  }
});

// ✅ Update only invigilators for an allocation
app.put("/api/allocations/:id/update-invigilators", async (req, res) => {
  try {
    const { id } = req.params;
    const { invigilators } = req.body;

    const updated = await Allocation.findByIdAndUpdate(
      id,
      { invigilators },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating invigilators:", err);
    res.status(500).json({ message: "Failed to update invigilators" });
  }
});




// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 Student Room Allocation API is running");
});

app.listen(PORT, () => {
  console.log(`🔵 Server running at http://localhost:${PORT}`);
});
