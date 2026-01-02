const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
require("dotenv").config();
const fs = require("fs");

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

// Validate benches: max 2 students per bench and if 2 students they must be from different years
async function validateAllocationsYears(allocations) {
  // gather roll numbers from all allocations
  const rollSet = new Set();
  allocations.forEach((allocation) => {
    if (Array.isArray(allocation.students)) {
      allocation.students.forEach((s) => {
        if (s && s.rollno) rollSet.add(s.rollno.toUpperCase());
      });
    }
  });

  const rollnos = Array.from(rollSet);
  if (rollnos.length === 0) return true;

  // fetch students to determine their years
  const studentDocs = await Student.find({ rollno: { $in: rollnos } });
  const rollToYear = {};
  studentDocs.forEach((sd) => {
    if (sd.rollno) rollToYear[sd.rollno.toUpperCase()] = sd.year;
  });

  // validate each allocation's benches
  for (const allocation of allocations) {
    const benches = {}; // key -> array of {roll, year}

    const studs = Array.isArray(allocation.students) ? allocation.students : [];
    for (const s of studs) {
      const roll = (s.rollno || "").toUpperCase();
      const key = (s.row != null && s.col != null) ? `${s.row}-${s.col}` : `bench-${s.benchNo || 0}`;
      if (!benches[key]) benches[key] = [];
      benches[key].push({ roll, year: rollToYear[roll] || null });
    }

    for (const [key, arr] of Object.entries(benches)) {
      // Enforce max 2 students per bench
      if (arr.length > 2) {
        const err = new Error(`Bench ${key} has more than 2 students`);
        err.code = 'BENCH_FULL';
        throw err;
      }

      // If two students present, they must be from different years
      if (arr.length === 2) {
        const y0 = arr[0].year;
        const y1 = arr[1].year;
        if (!y0 || !y1) {
          const err = new Error(`Student year information missing for bench ${key}`);
          err.code = 'MISSING_YEAR';
          throw err;
        }
        if (y0 === y1) {
          const err = new Error(
            'Already this year student is present in this class and they are writing exam at the same time. No enough space to allocate.'
          );
          err.code = 'SAME_YEAR';
          throw err;
        }
      }
    }
  }

  return true;
}

// Validate rooms/labs: max 2 different years per room/lab for the same examDate/time/session
async function validateRoomYears(allocations, options = {}) {
  const { model = Allocation, keyField = 'room' } = options;

  // build combos from incoming allocations
  const combos = {}; // comboKey -> { keyVal, examDate, time, session, incomingYears:Set }

  allocations.forEach((a) => {
    const keyVal = (a[keyField] || '').toString();
    const examDate = a.examDate;
    const time = a.time;
    const session = a.session;
    const comboKey = `${keyVal}||${examDate}||${time}||${session}`;
    if (!combos[comboKey]) {
      combos[comboKey] = { keyVal, examDate, time, session, incomingYears: new Set() };
    }
    if (a.year) combos[comboKey].incomingYears.add(a.year.toString());
  });

  for (const comboKey of Object.keys(combos)) {
    const { keyVal, examDate, time, session, incomingYears } = combos[comboKey];

    // quick checks on incoming
    if (incomingYears.size > 2) {
      const err = new Error(
        `Cannot allocate more than two different years in ${keyField} ${keyVal}`
      );
      err.code = 'INCOMING_TOO_MANY_YEARS';
      throw err;
    }

    // build query
    const query = { [keyField]: keyVal, time, session };

    // For Allocation model examDate is a string; for LabAllocation it's a Date
    if (model && model.modelName === 'LabAllocation') {
      query.examDate = new Date(examDate);
    } else {
      query.examDate = examDate;
    }

    const existing = await model.find(query);
    const existingYears = new Set(existing.map((e) => e.year && e.year.toString()));

    // If any incoming year already exists in DB for same room+time+session -> error (same year duplicate)
    for (const iy of incomingYears) {
      if (existingYears.has(iy)) {
        const err = new Error(
          'Already this year student is present in this room and they are writing exam at the same time. No enough space to allocate.'
        );
        err.code = 'SAME_YEAR_ROOM';
        throw err;
      }
    }

    // Combined distinct years
    const combined = new Set([...existingYears, ...incomingYears]);
    if (combined.size > 2) {
      const err = new Error(
        `Room ${keyVal} already contains students from two different years; cannot add a third year.`
      );
      err.code = 'THIRD_YEAR_ROOM';
      throw err;
    }
  }

  return true;
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


function excelDateToDDMMYYYY(excelDate) {
  if (!excelDate) return "";

  // If already string like 28-08-2005
  if (typeof excelDate === "string" && excelDate.includes("-")) {
    return excelDate;
  }

  // Excel serial number → JS date
  const jsDate = new Date((excelDate - 25569) * 86400 * 1000);

  const day = String(jsDate.getDate()).padStart(2, "0");
  const month = String(jsDate.getMonth() + 1).padStart(2, "0");
  const year = jsDate.getFullYear();

  return `${day}-${month}-${year}`;
}

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
      password: excelDateToDDMMYYYY(row.dob),
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
// ✅ Helper: Check if roll number is in string range (e.g. "23ADR101 - 23ADR130")
function isRollInStringRange(roll, rangeStr) {
  if (!rangeStr) return false;
  const parts = rangeStr.split("-").map((p) => p.trim().toUpperCase());
  if (parts.length !== 2) return false;
  return isRollInRange(roll, parts[0], parts[1]); // reuse your existing range logic
}
app.post("/api/student-login", async (req, res) => {
  const { name, rollno, className, year, password } = req.body;

  // ✅ Input validation
  if (!rollno || !name || !className || !year || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const roll = rollno.trim().toUpperCase();
    const cls = className.trim().toUpperCase();
    const yr = year.trim();
    const pwd = password.trim();
    const nm = name.trim();

    // ✅ Authenticate student
    const student = await Student.findOne({
      rollno: roll,
      className: cls,
      password: pwd,
      year: yr,
      name: { $regex: new RegExp(`^${nm}$`, "i") },
    });

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Fetch allocations
    const allocations = await Allocation.find({});
    const matched = allocations.filter(
      (a) =>
        (a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)) ||
        (a.rollNumbers && isRollInStringRange(roll, a.rollNumbers))
    );

    const matchedWithBench = matched.map((a) => {
      const allocatedStudent = a.students.find(
        (s) => s.rollno && s.rollno.toUpperCase() === roll
      );
      return {
        ...a._doc,
        benchPosition: allocatedStudent
          ? {
              row: allocatedStudent.row,
              col: allocatedStudent.col,
              benchNo: allocatedStudent.benchNo,
            }
          : null,
      };
    });

    // ✅ Lab allocations
    const labAllocations = await LabAllocation.find({});
    const matchedLabAllocations = labAllocations.filter(
      (a) => a.rollStart && a.rollEnd && isRollInRange(roll, a.rollStart, a.rollEnd)
    );

    res.status(200).json({
      message: "Login successful",
      student,
      allocations: [...matchedWithBench, ...matchedLabAllocations],
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Fetch allocations for a roll number
// ✅ Fetch allocations for a roll number (bench-wise ready)


// ====================== SAVE ALLOCATIONS ======================
// ====================== SAVE ALLOCATIONS ======================
app.post("/api/save-allocations", async (req, res) => {
  try {
    let allocations = [];

    if (!req.body.allocations) {
      allocations = [req.body];
    } else {
      allocations = req.body.allocations;
    }

    const allocationsWithExpiry = allocations.map((allocation) => {
      let rollNumbers = allocation.rollNumbers || "";
      let rollStart = allocation.rollStart || null;
      let rollEnd = allocation.rollEnd || null;
      let students = [];

      // Case A: frontend sends studentPositions
      if (Array.isArray(allocation.studentPositions) && allocation.studentPositions.length > 0) {
        students = allocation.studentPositions.map((s, idx) => ({
          name: s.name || "",
          rollno: s.roll || "", // ✅ must match schema
          row: s.row || null,
          col: s.col || null,
          benchNo: s.benchNo || idx + 1,
        }));

        rollNumbers = students.map((s) => s.rollno).join(",");
        rollStart = students[0]?.rollno || null;
        rollEnd = students[students.length - 1]?.rollno || null;
      }

      // Case B: fallback for assignedStudents
      else if (Array.isArray(allocation.assignedStudents) && allocation.assignedStudents.length > 0) {
        const assignedStudents = allocation.assignedStudents;
        const assignedStudentNames = Array.isArray(allocation.assignedStudentsName)
          ? allocation.assignedStudentsName
          : [];

        let rollIndex = 0;
        const totalRows = allocation.rows || 5;
        const totalCols = allocation.columns || 5;

        for (let c = 1; c <= totalCols; c++) {
          for (let r = 1; r <= totalRows; r++) {
            if (rollIndex >= assignedStudents.length) break;

            students.push({
              name: assignedStudentNames[rollIndex] || "",
              rollno: assignedStudents[rollIndex], // ✅ schema matches
              row: r,
              col: c,
              benchNo: rollIndex + 1,
            });

            rollIndex++;
          }
        }

        rollNumbers = assignedStudents.join(",");
        rollStart = assignedStudents[0];
        rollEnd = assignedStudents[assignedStudents.length - 1];
      }

      return {
        ...allocation,
        examName: allocation.subjectWithCode || allocation.examName,
        rollNumbers,
        rollStart,
        rollEnd,
        totalStudents: students.length || allocation.totalStudents || 0,
        students, // ✅ now properly saved
        expiryDate: new Date(
          new Date(allocation.examDate).getTime() + 3 * 24 * 60 * 60 * 1000
        ),
      };
    });

      // validate room/lab rules then bench rules before saving
      try {
        await validateRoomYears(allocationsWithExpiry, { model: Allocation, keyField: 'room' });
        await validateAllocationsYears(allocationsWithExpiry);
      } catch (validationErr) {
        console.error("Allocation validation error:", validationErr);
        return res.status(400).json({ message: validationErr.message });
      }

      await Allocation.insertMany(allocationsWithExpiry);

      res.status(200).json({
        message: "Allocations saved with seating info",
        allocations: allocationsWithExpiry,
      });
  } catch (err) {
    console.error("Saving allocations error:", err);
    res.status(500).json({ message: "Failed to save allocations", error: err.message });
  }
});



// ====================== FETCH ALLOCATION FOR A STUDENT ======================
app.get("/api/allocation/:rollno", async (req, res) => {
  const roll = req.params.rollno.trim().toUpperCase();

  try {
    const allocations = await Allocation.find({});
    const labAllocations = await LabAllocation.find({});

    function findStudentInAllocation(allocation, roll) {
      if (allocation.students && allocation.students.length > 0) {
        return allocation.students.find((s) => s.roll.toUpperCase() === roll) || null;
      }
      return null;
    }

    const matched = allocations
      .map((a) => {
        const student = findStudentInAllocation(a, roll);
        if (student) {
          return {
            ...a._doc,
            studentInfo: {
              roll: student.roll,
              name: student.name,
              row: student.row,
              col: student.col,
              benchNo: student.benchNo,
            },
          };
        }
        return null;
      })
      .filter((a) => a !== null);

    const matchedLab = labAllocations
      .map((a) => {
        const student = findStudentInAllocation(a, roll);
        if (student) {
          return {
            ...a._doc,
            studentInfo: {
              roll: student.roll,
              name: student.name,
              row: student.row,
              col: student.col,
              benchNo: student.benchNo,
            },
          };
        }
        return null;
      })
      .filter((a) => a !== null);

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



app.post("/api/save-lab-allocations", async (req, res) => {
  try {
    const allocations = req.body.allocations.map((a) => ({
      ...a,
      expiryDate: new Date(new Date(a.examDate).getTime() + 3 * 24 * 60 * 60 * 1000),
    }));

    // validate lab room/year rules then bench rules before saving lab allocations
    try {
      await validateRoomYears(allocations, { model: LabAllocation, keyField: 'lab' });
      await validateAllocationsYears(allocations);
    } catch (validationErr) {
      console.error("Lab allocation validation error:", validationErr);
      return res.status(400).json({ message: validationErr.message });
    }

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
// GET /api/students/:className/:year
app.get("/api/students/:className/:year", async (req, res) => {
  const { className, year } = req.params;

  try {
    const students = await Student.find({
      className: className.trim().toUpperCase(),
      year: year.trim(),
    }).sort({ rollno: 1 });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.status(200).json(students);
  } catch (err) {
    console.error("❌ Fetch class students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- DELETE ALLOCATION -------------------- */

// Delete allocation by ID
app.delete("/api/allocations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Allocation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    res.status(200).json({ message: "Allocation deleted successfully" });
  } catch (err) {
    console.error("Delete allocation error:", err);
    res.status(500).json({ message: "Failed to delete allocation" });
  }
});

// Delete lab allocation by ID (optional, if you also want to delete lab allocations)
app.delete("/api/lab-allocations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await LabAllocation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Lab allocation not found" });
    }

    res.status(200).json({ message: "Lab allocation deleted successfully" });
  } catch (err) {
    console.error("Delete lab allocation error:", err);
    res.status(500).json({ message: "Failed to delete lab allocation" });
  }
});



/* -------------------- HEALTH CHECK -------------------- */

app.get("/", (req, res) => {
  res.send("🚀 Student Room Allocation API is running");
});

app.listen(PORT, () => {
  console.log(`🔵 Server running at http://localhost:${PORT}`);
});
