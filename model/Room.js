const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  location: String,
  rating: Number,
  review: Number,
  images: [String],
  price: Number,
  booked: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Room', roomSchema);
