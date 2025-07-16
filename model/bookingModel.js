const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomId: String,
  roomName: String,
  roomImage: String,
  checkIn: String,
  checkOut: String,
  guest: Number,
  foodCost: Number,
  maintenanceCost: Number,
  gymFee: Number,
  totalCost: Number,
  customerName: String,
  idProofType: String,
  idProofNumber: String,
});

module.exports = mongoose.model('Booking', bookingSchema);
