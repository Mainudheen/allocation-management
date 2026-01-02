const mongoose = require("mongoose");

/**
 * Student sub-schema
 * One bench can contain max 2 students (enforced in logic layer)
 */
const studentSchema = new mongoose.Schema(
  {
    name: String,
    rollno: { type: String, required: true },
    row: { type: Number },     // seating row
    col: { type: Number },     // seating column
    benchNo: { type: Number }, // bench number
  },
  { _id: false }
);

/**
 * Allocation schema
 */
const allocationSchema = new mongoose.Schema(
  {
    examName: String,          // Maps to subjectWithCode
    examDate: { type: String, required: true },
    time: { type: String, required: true },
    cat: String,
    session: { type: String, required: true },

    subjectWithCode: String,
    year: { type: String, required: true }, // IMPORTANT FIELD
    semester: String,

    hallNo: String,
    room: { type: String, required: true },

    totalStudents: Number,
    rollNumbers: String,       // Range string
    rollStart: String,
    rollEnd: String,

    invigilators: [String],

    students: [studentSchema],

    expiryDate: {
      type: Date,
      required: true,
      index: { expires: 0 },   // TTL index
    },
  },
  { timestamps: true }
);

/**
 * 🔒 COMPOUND UNIQUE INDEX
 * Prevents SAME YEAR allocation in SAME ROOM at SAME TIME & SESSION
 */
allocationSchema.index(
  {
    room: 1,
    examDate: 1,
    time: 1,
    session: 1,
    year: 1,
  },
  {
    unique: true,
    name: "unique_room_date_time_session_year",
  }
);

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.Allocation ||
  mongoose.model("Allocation", allocationSchema);
