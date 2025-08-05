const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  examName: String, // Maps to subjectWithCode
  examDate: String,
  room: String,
  hallNo: String,
  totalStudents: Number,
  rollNumbers: String, // Store as range string (e.g., "CS001–CS030")
  cat: String,
  session: String,
  year: String,
  semNo: String,
  invigilators: [String],
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index triggers expiration
  }
});

module.exports = mongoose.model("Allocation", allocationSchema);