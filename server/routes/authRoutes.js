const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../models/userModel');
require('dotenv').config(); // To access JWT_SECRET

const router = express.Router();

// Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    if (!email || !password || !name || !userType) {
      return res.status(400).json({ message: 'All fields are required: email, password, name, userType' });
    }

    if (userType !== 'restaurant' && userType !== 'organization') {
      return res.status(400).json({ message: 'userType must be either "restaurant" or "organization"' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = await createUser({
      email,
      password: hashedPassword,
      name,
      userType,
    });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); // User not found
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Password doesn't match
    }

    const token = jwt.sign( // This might cause an error due to the placeholder string
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ token, user: userWithoutPassword });

  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(500).json({ message: 'Error generating token. Is JWT_SECRET set?' });
    }
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
