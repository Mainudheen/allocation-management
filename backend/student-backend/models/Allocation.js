const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  examName: String,
  examDate: String,
  cat: String,
  session: String,
  subjectWithCode: String,
  year: String,
  semester: String,
  hallNo: String,
  room: String,
  invigilators: [String],
  rollStart: String,   // ← Starting roll number of range
  rollEnd: String,     // ← Ending roll number of range
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
});

module.exports = mongoose.model("Allocation", allocationSchema);
