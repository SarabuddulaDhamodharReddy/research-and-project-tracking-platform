const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require("passport");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,        // ✅ Added
      photo: user.photo || "" // ✅ Added
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, department });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// @route   GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user); // ✅ Uses updated generateToken
    res.redirect(`https://research-and-project-tracking-platf-rho.vercel.app/auth-success?token=${token}`);  }
);

module.exports = router;