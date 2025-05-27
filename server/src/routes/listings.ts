import express, { Request, Response } from 'express';
import { authMiddleware, authorizeRole, AuthRequest } from '../middleware/auth'; // Assuming auth middleware is in ../middleware/auth
import Listing, { IListing } from '../models/Listing'; // Assuming Listing model is in ../models/Listing
import User from '../models/User'; // Assuming User model is in ../models/User

const router = express.Router();

// POST /api/listings (Create Listing - Restaurant only)
router.post(
  '/',
  authMiddleware,
  authorizeRole(['restaurant']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { foodItem, quantity, expiryDate } = req.body;

      // Validate request body
      if (!foodItem || !quantity || !expiryDate) {
        return res.status(400).json({ message: 'Missing required fields (foodItem, quantity, expiryDate)' });
      }

      // Validate expiryDate format (optional, but good practice)
      if (isNaN(new Date(expiryDate).getTime())) {
        return res.status(400).json({ message: 'Invalid expiryDate format' });
      }

      const newListing: IListing = new Listing({
        restaurant: req.user!.id, // Set restaurant to the logged-in user's ID
        foodItem,
        quantity,
        expiryDate: new Date(expiryDate),
        status: 'available', // Default status
      });

      await newListing.save();
      res.status(201).json(newListing);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// GET /api/listings (Get All Available Listings - Authenticated users)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const listings = await Listing.find({ status: 'available' })
      .populate('restaurant', 'name address phone email') // Populate restaurant details
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.json(listings);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/listings/:id (Get Specific Listing - Authenticated users)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('restaurant', 'name address phone email'); // Populate restaurant details

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format for :id
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }
    res.status(500).send('Server error');
  }
});

// PUT /api/listings/:id/claim (Claim Listing - Organization only)
router.put(
  '/:id/claim',
  authMiddleware,
  authorizeRole(['organization']),
  async (req: AuthRequest, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.status !== 'available') {
        return res.status(400).json({ message: 'Listing is not available for claiming' });
      }

      listing.status = 'claimed';
      listing.claimedBy = req.user!.id; // Set claimedBy to the logged-in user's ID

      await listing.save();
      res.json(listing);
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid listing ID format' });
      }
      res.status(500).send('Server error');
    }
  }
);

// PUT /api/listings/:id (Update Listing - Restaurant owner only)
router.put(
  '/:id',
  authMiddleware,
  authorizeRole(['restaurant']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { foodItem, quantity, expiryDate, status } = req.body;
      let listing = await Listing.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      // Check if the logged-in user is the owner of the listing
      if (listing.restaurant.toString() !== req.user!.id) {
        return res.status(403).json({ message: 'User not authorized to update this listing' });
      }

      // Validate request body (optional, but good practice for updates)
      if (!foodItem && !quantity && !expiryDate && !status) {
        return res.status(400).json({ message: 'No fields to update provided' });
      }
      if (expiryDate && isNaN(new Date(expiryDate).getTime())) {
        return res.status(400).json({ message: 'Invalid expiryDate format' });
      }
      if (status && !['available', 'claimed', 'expired'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }


      // Update fields if provided
      if (foodItem) listing.foodItem = foodItem;
      if (quantity) listing.quantity = quantity;
      if (expiryDate) listing.expiryDate = new Date(expiryDate);
      if (status) {
        // If status is changed to 'available', clear claimedBy
        if (status === 'available' && listing.status !== 'available') {
            listing.claimedBy = undefined;
        }
        listing.status = status;
      }


      await listing.save();
      res.json(listing);
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid listing ID format' });
      }
      res.status(500).send('Server error');
    }
  }
);

// DELETE /api/listings/:id (Delete Listing - Restaurant owner only)
router.delete(
  '/:id',
  authMiddleware,
  authorizeRole(['restaurant']),
  async (req: AuthRequest, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      // Check if the logged-in user is the owner of the listing
      if (listing.restaurant.toString() !== req.user!.id) {
        return res.status(403).json({ message: 'User not authorized to delete this listing' });
      }

      // Instead of direct deletion, consider marking as 'deleted' or 'archived'
      // For this task, we will perform a hard delete as per standard CRUD.
      await Listing.findByIdAndDelete(req.params.id);

      res.json({ message: 'Listing deleted successfully' });
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid listing ID format' });
      }
      res.status(500).send('Server error');
    }
  }
);

export default router;
