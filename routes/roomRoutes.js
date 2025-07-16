const express = require('express');
const router = express.Router();
const Room = require('../model/Room');

// Get all rooms
router.get('/', async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// Get room by ID
router.get('/:id', async (req, res) => {
  const room = await Room.findById(req.params.id);
  res.json(room);
});

// Add room
router.post('/', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Failed to add room:', error);
    res.status(500).json({ message: 'Failed to add room' });
  }
});

// Mark room as booked
router.put('/:id/book', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { booked: true },
      { new: true }
    );
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark room as booked' });
  }
});


// Delete room
router.delete('/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
