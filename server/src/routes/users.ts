import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth'; // Assuming auth middleware is in ../middleware/auth
import User from '../models/User'; // Assuming User model is in ../models/User
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/users/me (Get My Profile - Authenticated users)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // req.user.id is available from authMiddleware
    const user = await User.findById(req.user!.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/users/me (Update My Profile - Authenticated users)
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, phone, password, email, role } = req.body; // Include password for update

    // Fields that should not be updatable directly via this route
    if (email || role) {
        return res.status(400).json({ message: 'Email and role cannot be updated via this route.' });
    }

    const user = await User.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (address) user.address = address;
    if (phone) user.phone = phone;

    // Update password if provided
    if (password) {
      if (password.length < 6) { // Example validation for password length
          return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
