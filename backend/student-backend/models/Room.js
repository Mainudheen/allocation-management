const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  floor: { type: String, required: true },
  benches: { type: Number, required: true }, // total number of benches
  rows: { type: Number, required: true },    // number of rows
  columns: { type: Number, required: true }  // number of columns per row
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
