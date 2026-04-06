const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// ✅ Import passport AFTER dotenv.config() so env vars are available
const passport = require("passport");
require("./config/passport");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://research-and-project-tracking-platform-sb8i-dyhsktugg.vercel.app"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize()); // ✅ Moved BEFORE routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));   // ✅ For normal login/register
app.use('/api/projects', require('./routes/projects'));
app.use('/api/requests', require('./routes/requests'));
app.use("/auth", require("./routes/auth"));       // ✅ For Google OAuth routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Research Platform API is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });