const express = require('express');
const router = express.Router();
const Room = require('../model/Room');

// ✅ Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});






















// ✅ Add new room
router.post('/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error saving room' });
  }
});

// ✅ Get single room by MongoDB ID
router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error('Error fetching room by ID:', err);
    res.status(500).json({ message: 'Unable to fetch room' });
  }
});

// ✅ Delete room
router.delete('/rooms/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// ✅ Update booked status


module.exports = router;
