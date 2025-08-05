const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  examName: String, // Maps to subjectWithCode
  examDate: String,
  cat: String,
  session: String,
  subjectWithCode: String,
  year: String,
  semester: String,
  hallNo: String,
  room: String,
  hallNo: String,
  totalStudents: Number,
  rollNumbers: String, // Store as range string (e.g., "CS001–CS030")
  cat: String,
  session: String,
  year: String,
  semNo: String,
  invigilators: [String],
<<<<<<< HEAD
=======
  rollStart: String,   // ← Starting roll number of range
  rollEnd: String,     // ← Ending roll number of range
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
});

module.exports = mongoose.model("Allocation", allocationSchema);