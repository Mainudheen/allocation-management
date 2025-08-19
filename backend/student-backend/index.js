const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
require("dotenv").config();

// Models
const Room = require("./models/Room");
const LabAllocation = require("./models/LabAllocate");
const Student = require("./models/Student");
const Allocation = require("./models/Allocation");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ File upload setup
const upload = multer({ dest: "uploads/" });

// ✅ Routes
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Check if a roll number lies between rollStart and rollEnd
function isRollInRange(rollno, start, end) {
  return rollno.localeCompare(start) >= 0 && rollno.localeCompare(end) <= 0;
}

/* -------------------- STUDENT MANAGEMENT -------------------- */

// ✅ Add single student
app.post("/api/students/add", async (req, res) => {
  try {
    const { name, rollno, className, year, dob } = req.body;

    const newStudent = new Student({
      name,
      rollno: rollno.toUpperCase(),
      className: className.toUpperCase(),
      year,
      password: dob, // dob used as password
    });

    await newStudent.save();
    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ message: "Failed to add student" });
  }
});

// ✅ Bulk upload students via Excel
app.post("/api/students/upload", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const students = sheetData.map((row) => ({
      name: row.name,
      rollno: row.rollno.toUpperCase(),
      className: row.className.toUpperCase(),
      year: row.year,
      password: row.dob,
    }));

    await Student.insertMany(students);
     fs.unlinkSync(req.file.path);
    res.status(201).json({ message: "Students uploaded successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload students" });
  }
});

// ✅ Delete student by roll number
app.delete("/api/students/delete/:rollno", async (req, res) => {
  try {
    const roll = req.params.rollno.toUpperCase();
    await Student.deleteOne({ rollno: roll });
    res.status(200).json({ message: `Student ${roll} deleted` });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
});

// ✅ Delete students by year
app.delete("/api/students/delete-by-year/:year", async (req, res) => {
  try {
    const year = req.params.year.trim();
    const result = await Student.deleteMany({ year });
    res
      .status(200)
      .json({ message: `${result.deletedCount} students deleted from year ${year}` });
  } catch (err) {
    console.error("Delete by year error:", err);
    res.status(500).json({ message: "Failed to delete students" });
  }
});

// ✅ Delete students by class
app.delete("/api/students/delete-by-class/:className", async (req, res) => {
  try {
    const cls = req.params.className.trim().toUpperCase();
    const result = await Student.deleteMany({ className: cls });
    res
      .status(200)
      .json({ message: `${result.deletedCount} students deleted from class ${cls}` });
  } catch (err) {
    console.error("Delete by class error:", err);
    res.status(500).json({ message: "Failed to delete students" });
  }
});

/* -------------------- STUDENT LOGIN -------------------- */

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
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const allocations = await Allocation.find({});
    const matched = allocations.filter(
      (a) => a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );

    const labAllocations = await LabAllocation.find({});
    const matchedLabAllocations = labAllocations.filter(
      (a) => a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );

    res.status(200).json({
      message: "Login successful",
      student,
      allocations: [...matched, ...matchedLabAllocations],
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
    const labAllocations = await LabAllocation.find({});
    const matched = allocations.filter(
      (a) => a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );
    const matchedLab = labAllocations.filter(
      (a) => a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );

    const combined = [...matched, ...matchedLab];

    if (combined.length > 0) {
      res.status(200).json(combined);
    } else {
      res.status(404).json({ message: "No allocation found" });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- ALLOCATIONS -------------------- */

// ✅ Save Allocations with expiry date (3 days after examDate)
app.post("/api/save-allocations", async (req, res) => {
  try {
    const allocationsWithExpiry = req.body.allocations.map((allocation) => ({
      ...allocation,
      expiryDate: new Date(
        new Date(allocation.examDate).getTime() + 3 * 24 * 60 * 60 * 1000
      ),
    }));

    await Allocation.insertMany(allocationsWithExpiry);
    res.status(200).json({ message: "Allocations saved with expiry" });
  } catch (err) {
    console.error("Saving allocations error:", err);
    res.status(500).json({ message: "Failed to save allocations" });
  }
});

app.post("/api/save-lab-allocations", async (req, res) => {
  try {
    const allocations = req.body.allocations.map((a) => ({
      ...a,
      expiryDate: new Date(new Date(a.examDate).getTime() + 3 * 24 * 60 * 60 * 1000),
    }));

    await LabAllocation.insertMany(allocations);
    res.status(200).json({ message: "Lab allocations saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save lab allocations" });
  }
});

app.get("/api/lab-allocations", async (req, res) => {
  try {
    const now = new Date();
    const labAllocations = await LabAllocation.find({ expiryDate: { $gte: now } });
    res.status(200).json(labAllocations);
  } catch (err) {
    console.error("Fetch all lab allocations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update lab allocation by ID
app.put("/api/lab-allocation/:id", async (req, res) => {
  try {
    const updated = await LabAllocation.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error("Lab allocation update error:", err);
    res.status(500).json({ message: "Failed to update lab allocation" });
  }
});

// Update invigilators in a lab allocation
app.put("/api/lab-allocations/:id/update-invigilators", async (req, res) => {
  try {
    const { id } = req.params;
    const { invigilators } = req.body;

    const updated = await LabAllocation.findByIdAndUpdate(
      id,
      { invigilators },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating lab invigilators:", err);
    res.status(500).json({ message: "Failed to update lab invigilators" });
  }
});

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

// GET /api/students/get/:rollno
app.get("/api/students/get/:rollno", async (req, res) => {
  try {
    const student = await Student.findOne({ rollno: req.params.rollno });
    if (!student) return res.status(404).send(null);
    res.send(student);
  } catch (err) {
    res.status(500).send(err);
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

/* -------------------- HEALTH CHECK -------------------- */

app.get("/", (req, res) => {
  res.send("🚀 Student Room Allocation API is running");
});

app.listen(PORT, () => {
  console.log(`🔵 Server running at http://localhost:${PORT}`);
});
