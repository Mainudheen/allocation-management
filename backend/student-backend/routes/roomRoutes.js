const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ floor: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    console.error("Room fetch error:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// Add a new room
router.post('/', async (req, res) => {
  try {
    const { roomNo, floor, benches } = req.body;
    const newRoom = new Room({ roomNo, floor, benches });
    await newRoom.save();
    res.status(201).json({ message: 'Room added successfully', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error adding room', error });
  }
});


module.exports = router;
