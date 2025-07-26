const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Dummy student data (you can replace this with DB later)
const students = [
  { name: "Arun",rollno:"23ADR101", className: "AIDS-A", year: "III", password: "1234" },
  { name: "Divya",rollno:"23ADR102", className: "AIDS-B", year: "II", password: "abcd" }
];

// Login route
app.post("/api/student-login", (req, res) => {
  const { name,rollno, className, year, password } = req.body;

  const student = students.find(
    s =>
      s.name === name &&
      s.rollno === rollno &&
      s.className === className &&
      s.year === year &&
      s.password === password
  );

  if (student) {
    res.status(200).json({ message: "Login successful", student });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});
app.get("/", (req, res) => {
  res.send("Student Login API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
