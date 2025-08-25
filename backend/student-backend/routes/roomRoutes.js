const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// =============================
// Helper: normalize columns (force numbers, default rows = 0)
// =============================
function normalizeColumns(columns) {
  return columns.map((col, i) => ({
    colNo: Number(col.colNo || i + 1),
    rows: Number(col.rows) || 0,
  }));
}

// =============================
// Helper: calculate benches
// =============================
function calculateTotalBenches(columns) {
  return columns.reduce((sum, col) => sum + (col.rows || 0), 0);
}

// =============================
// Get a single room by roomNo
// =============================
router.get("/:roomNo", async (req, res) => {
  try {
    const room = await Room.findOne({ roomNo: req.params.roomNo });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const totalBenches = calculateTotalBenches(room.columns);

    res.status(200).json({ ...room.toObject(), totalBenches });
  } catch (error) {
    console.error("❌ Error fetching room:", error);
    res.status(500).json({ message: "Error fetching room", error: error.message });
  }
});


// =============================
// Get all rooms (sorted by floor, roomNo)
// =============================
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ floor: 1, roomNo: 1 });

    // Attach totalBenches dynamically
    const roomsWithTotals = rooms.map((room) => ({
      ...room.toObject(),
      totalBenches: calculateTotalBenches(room.columns),
    }));

    res.status(200).json(roomsWithTotals);
  } catch (err) {
    console.error("❌ Room fetch error:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// =============================
// Add a new room
// =============================
router.post("/", async (req, res) => {
  try {
    console.log("📩 Received body:", req.body);
    let { roomNo, floor, columns } = req.body;

    // Validate base fields
    if (!roomNo || !floor || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        message: "Fields (roomNo, floor, columns[]) are required",
      });
    }

    // Normalize input
    columns = normalizeColumns(columns);

    // Validate columns (must have rows >= 1)
    for (const col of columns) {
      if (col.rows <= 0) {
        return res.status(400).json({
          message: "Each column must have rows > 0",
        });
      }
    }

    // Prevent duplicate room numbers
    const existingRoom = await Room.findOne({ roomNo });
    if (existingRoom) {
      return res.status(400).json({ message: `Room ${roomNo} already exists` });
    }

    const totalBenches = calculateTotalBenches(columns);

    const newRoom = new Room({ roomNo, floor, columns });
    await newRoom.save();

    res.status(201).json({
      message: "✅ Room added successfully",
      room: { ...newRoom.toObject(), totalBenches },
    });
  } catch (error) {
    console.error("❌ Error adding room:", error);
    res.status(500).json({ message: "Error adding room", error: error.message });
  }
});

// =============================
// Delete a room
// =============================
router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res
      .status(200)
      .json({ message: `✅ Room ${room.roomNo} deleted successfully` });
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ message: "Error deleting room", error: error.message });
  }
});

// =============================
// Update a room
// =============================
router.put("/:id", async (req, res) => {
  try {
    let { roomNo, floor, columns } = req.body;

    if (!roomNo || !floor || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        message: "Fields (roomNo, floor, columns[]) are required",
      });
    }

    // Normalize input
    columns = normalizeColumns(columns);

    for (const col of columns) {
      if (col.rows <= 0) {
        return res.status(400).json({
          message: "Each column must have rows > 0",
        });
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNo, floor, columns },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const totalBenches = calculateTotalBenches(columns);

    res.status(200).json({
      message: "✅ Room updated successfully",
      room: { ...updatedRoom.toObject(), totalBenches },
    });
  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).json({ message: "Error updating room", error: error.message });
  }
});

module.exports = router;
