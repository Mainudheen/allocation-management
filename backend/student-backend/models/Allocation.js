const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  examName: String,
  examDate: String,
  room: String,
  invigilators: [String],
  rollNumbers: [String] // ← this is now an array
});

module.exports = mongoose.model("Allocation", allocationSchema);
