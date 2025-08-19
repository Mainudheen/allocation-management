const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// =============================
// Get all rooms (sorted by floor)
// =============================
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ floor: 1, roomNo: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    console.error("❌ Room fetch error:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// =============================
// Add a new room
// =============================
router.post('/', async (req, res) => {
  try {
    const { roomNo, floor, benches } = req.body;

    // Basic validation
    if (!roomNo || !floor || !benches) {
      return res.status(400).json({ message: "All fields (roomNo, floor, benches) are required" });
    }

    if (benches <= 0) {
      return res.status(400).json({ message: "Benches must be greater than 0" });
    }

    // Prevent duplicate room numbers
    const existingRoom = await Room.findOne({ roomNo });
    if (existingRoom) {
      return res.status(400).json({ message: `Room ${roomNo} already exists` });
    }

    const newRoom = new Room({ roomNo, floor, benches });
    await newRoom.save();

    res.status(201).json({
      message: '✅ Room added successfully',
      room: newRoom
    });

  } catch (error) {
    console.error("❌ Error adding room:", error);
    res.status(500).json({ message: 'Error adding room', error: error.message });
  }
});

// =============================
// Delete a room
// =============================
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: `✅ Room ${room.roomNo} deleted successfully` });

  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ message: "Error deleting room", error: error.message });
  }
});

// =============================
// Update a room
// =============================
router.put('/:id', async (req, res) => {
  try {
    const { roomNo, floor, benches } = req.body;

    if (!roomNo || !floor || !benches) {
      return res.status(400).json({ message: "All fields (roomNo, floor, benches) are required" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNo, floor, benches },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: '✅ Room updated successfully',
      room: updatedRoom
    });

  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).json({ message: "Error updating room", error: error.message });
  }
});

module.exports = router;
