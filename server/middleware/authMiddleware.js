const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Differentiate between expired token and invalid token
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Access token expired' });
      }
      return res.status(403).json({ message: 'Access token is invalid' });
    }
    req.user = user; // Attach user payload (id, email, userType) to request
    next();
  });
}

function isRestaurant(req, res, next) {
  if (req.user && req.user.userType === 'restaurant') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Restaurant role required.' });
  }
}

module.exports = {
  authenticateToken,
  isRestaurant,
  isOrganization, // Added
};

function isOrganization(req, res, next) {
  if (req.user && req.user.userType === 'organization') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Organization role required.' });
  }
}
