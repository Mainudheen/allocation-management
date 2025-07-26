const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  rollno: String,
  year:String,
  className: String,
  password: String  // store DOB as password
});

module.exports = mongoose.model("Student", studentSchema);
