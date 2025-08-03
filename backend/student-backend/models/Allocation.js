const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  examName: String,
  examDate: String,
  room: String,
  invigilators: [String],
  rollNumbers: [String], // ← this is now an array
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index triggers expiration
  }
});

module.exports = mongoose.model("Allocation", allocationSchema);
