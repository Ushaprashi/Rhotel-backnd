const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Add Room
router.post('/addroom', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json({ message: 'Room Added Successfully', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error adding room', error });
  }
});

// Get All Rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
});

// Delete Room
router.delete('/rooms/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error });
  }
});

module.exports = router;
