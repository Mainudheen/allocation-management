const mongoose = require("mongoose");


const studentSchema = new mongoose.Schema({
  name: String,
  rollno: { type: String, required: true },
  row: { type: Number },     // seating row
  col: { type: Number },     // seating column
  benchNo: { type: Number }  // optional if you also track bench numbering
});


const allocationSchema = new mongoose.Schema({
  examName: String,          // Maps to subjectWithCode
  examDate: String,
  time: String,  
  cat: String,
  session: String,
  subjectWithCode: String,
  year: String,
  semester: String,
  hallNo: String,
  room: String,
  totalStudents: Number,
  rollNumbers: String,       // Store as range string (e.g., "CS001–CS030")
  invigilators: [String],
  rollStart: String,         // Starting roll number of range
  rollEnd: String,           // Ending roll number of range

   students: [studentSchema],


  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 }    // TTL index for auto-deletion
  }
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Allocation || mongoose.model("Allocation", allocationSchema);
