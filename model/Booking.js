// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  roomId: Number,
  roomName: String,
  roomImage: String,
  checkIn: String,
  checkOut: String,
  guest: Number,
  totalCost: Number,
  customerName: String,
  idProofType: String,
  idProofNumber: String,
  paymentStatus: {
    type: String,
    default: 'Pending' // ✅ Default value is okay here
  }
}, { timestamps: true }); // ✅ This is the correct place for timestamps

module.exports = mongoose.model('Booking', BookingSchema);
