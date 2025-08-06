// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  floor: { type: String, required: true },
  benches: { type: Number, required: true }
});

module.exports = mongoose.model('Room', roomSchema);
