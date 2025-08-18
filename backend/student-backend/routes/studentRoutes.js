const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Student = require("../models/Student");

const router = express.Router();

// 📌 Multer setup for file upload
const upload = multer({ dest: "uploads/" });

// ✅ Add a single student
router.post("/add", async (req, res) => {
  try {
    const { name, rollno, className, year, dob } = req.body;

    if (!name || !rollno || !className || !year || !dob) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newStudent = new Student({
      name: name.trim(),
      rollno: rollno.trim().toUpperCase(),
      className: className.trim().toUpperCase(),
      year: year.trim(),
      password: dob.trim(), // password = DOB
    });

    await newStudent.save();
    res.status(201).json({ message: "✅ Student added successfully" });
  } catch (err) {
    console.error("❌ Add student error:", err);
    res.status(500).json({ message: "Failed to add student" });
  }
});

// ✅ Bulk upload students from Excel
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Expecting columns: name, rollno, className, year, dob
    const students = sheetData.map((row) => ({
      name: String(row.name || "").trim(),
      rollno: String(row.rollno || "").trim().toUpperCase(),
      className: String(row.className || "").trim().toUpperCase(),
      year: String(row.year || "").trim(),
      password: String(row.dob || "").trim(),
    }));

    await Student.insertMany(students);
    // Remove uploaded file after processing
    fs.unlinkSync(path.resolve(filePath));

    res.status(201).json({ message: "✅ Students uploaded successfully" });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Failed to upload students" });
  }
});

// ✅ Delete one student by roll number
router.delete("/delete/:rollno", async (req, res) => {
  try {
    const roll = req.params.rollno.trim().toUpperCase();
    const result = await Student.deleteOne({ rollno: roll });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: `Student ${roll} not found` });
    }

    res.status(200).json({ message: `✅ Student ${roll} deleted` });
  } catch (err) {
    console.error("❌ Delete student error:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
});

// ✅ Delete students by year
router.delete("/delete-by-year/:year", async (req, res) => {
  try {
    const year = req.params.year.trim();
    const result = await Student.deleteMany({ year });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: `No students found for year ${year}` });
    }

    res
      .status(200)
      .json({ message: `✅ ${result.deletedCount} students deleted from year ${year}` });
  } catch (err) {
    console.error("❌ Delete by year error:", err);
    res.status(500).json({ message: "Failed to delete students" });
  }
});

module.exports = router;
