const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CustomerModel = require('./model/Customer');
const Booking = require('./model/Booking');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);


const app = express();
app.use(express.json());
app.use(cors());
console.log("Mongo URI:", process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await CustomerModel.findOne({ name, email });

    if (existingUser) {
      return res.status(409).json({ status: "exists", message: "User already exists" });
    }

    const newUser = await CustomerModel.create({ name, email, password });
    res.status(201).json({ status: "ok", user: newUser });

  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await CustomerModel.findOne({ email });

    if (user) {
      if (user.password === password) {
        return res.json({ status: "success", user });
      } else {
        return res.json({ status: "fail", message: "Password Incorrect" });
      }
    } else {
      return res.json({ status: "fail", message: "E-mail not registered" });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", error: err.message });
  }
});

app.post("/check-availability", async (req, res) => {
  const { checkIn, checkOut, guests, name, email, roomId } = req.body;

  try {
    const totalRooms = 5;

    const bookings = await Booking.find({
      roomId,
      $or: [
        { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } }
      ]
    });

    const availableRooms = totalRooms - bookings.length;

    if (availableRooms > 0) {
      await Booking.create({ checkIn, checkOut, guests, name, email, roomId });
      res.status(200).json({ available: true, availableRooms });
    } else {
      res.status(200).json({ available: false, availableRooms: 0 });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking availability" });
  }
});
app.post('/api/book', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(200).json({ message: 'Booking saved successfully' });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: 'Booking Failed' });
  }
});


app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking Cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});


app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: booking.roomName,
          },
          unit_amount: booking.totalCost * 100, // paise
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/bookinglist?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/bookinglist?payment=cancel`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe session create failed:', err.message);
    res.status(500).json({ error: 'Stripe session creation failed' });
  }
});


app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status === 'paid') {
      const bookingId = session.metadata.bookingId;
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Paid' });
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    console.error('Stripe Session Fetch Error:', error);
    res.status(500).json({ message: 'Failed to retrieve session' });
  }
});




app.post('/api/update-payment-status/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Booking.findByIdAndUpdate(id, { paymentStatus: 'Paid' });
        res.json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Update Payment Status Error:', error);
        res.status(500).json({ message: 'Error updating payment status' });
    }
});



app.put('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { isPaid: true });
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Payment Update Error:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.status(200).json({ message: 'Login successful' });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

const roomRoutes = require('./routes/roomRoutes');
app.use('/api/rooms', roomRoutes);


app.use('/api', require('./routes/rooms'));


app.post('/api/book', (req, res) => {
  console.log('Booking received:', req.body);
  res.status(200).json({ message: 'Booking success' });
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
