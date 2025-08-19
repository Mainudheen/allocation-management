const mongoose = require("mongoose");

const classExamAllocationSchema = new mongoose.Schema({
  examName: String, 
  examDate: String,
  cat: String,
  session: String,
  subjectWithCode: String,
  year: String,
  semester: String,
  hallNo: String,
  room: String,
  totalStudents: Number,

  // ✅ String format only (for ClassExamAllocator)
  rollNumbers: String,   // e.g. "23ADR101 – 23ADR130"

  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
});

module.exports = mongoose.model("ClassExamAllocation", classExamAllocationSchema);
