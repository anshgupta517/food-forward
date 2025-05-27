import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key'; // Use environment variable

// Define a custom interface to extend the Express Request interface
export interface AuthRequest extends Request {
  user?: { id: string; role: string }; // Add the user property
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Check if token is in the correct format (Bearer <token>)
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token is not valid (must be Bearer token)' });
  }

  const token = tokenParts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { user: { id: string; role: string } }; // Type assertion for decoded payload

    // Add user from payload to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check for specific roles
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next();
  };
};
