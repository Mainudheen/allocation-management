const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const Student = require("./models/Student"); // Make sure the path is correct

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ Mongo error:", err));

// 🟩 Student Login Route
app.post("/api/student-login", async (req, res) => {
  const { name, rollno, className, year, password } = req.body;

  try {
    const student = await Student.findOne({
      rollno: rollno.trim().toUpperCase(),
      className: className.trim().toUpperCase(),
      password: password.trim(),
      year:year.trim(),
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } // case-insensitive match
    });

    if (student) {
      return res.status(200).json({ message: "Login successful", student });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Student Login API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
