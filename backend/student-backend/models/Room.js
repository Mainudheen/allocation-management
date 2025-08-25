const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
  colNo: { type: Number, required: true },
  rows: { type: Number, required: true }, // benches in this column
});

const roomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  floor: { type: String, required: true },
  columns: [columnSchema], // per-column info
  totalBenches: { type: Number, default: 0 }, // ✅ auto-calculated
});

// 🔹 Pre-save middleware (for .save())
roomSchema.pre("save", function (next) {
  this.totalBenches = this.columns.reduce((sum, col) => sum + col.rows, 0);
  next();
});

// 🔹 Pre-update middleware (for findByIdAndUpdate / findOneAndUpdate)
roomSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.columns) {
    const total = update.columns.reduce((sum, col) => sum + col.rows, 0);
    this.setUpdate({ ...update, totalBenches: total });
  }
  next();
});

module.exports = mongoose.model("Room", roomSchema);
