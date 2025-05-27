const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import auth routes
const authRoutes = require('./routes/authRoutes');
// Import listing routes
const listingRoutes = require('./routes/listingRoutes');

app.use(cors());
app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes);
// Use listing routes
app.use('/api/listings', listingRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
