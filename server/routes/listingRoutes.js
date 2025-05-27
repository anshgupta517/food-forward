const express = require('express');
const {
  createListing,
  findListingsByRestaurantId,
  findListingById,
  findAllAvailableListings, // Added
  claimListing, // Added
  updateListing,
  deleteListing,
} = require('../models/listingModel');
const { authenticateToken, isRestaurant, isOrganization } = require('../middleware/authMiddleware'); // Added isOrganization

const router = express.Router();

// Protect all listing routes with authentication
router.use(authenticateToken);

// GET /api/listings - View all available listings (For Organizations)
router.get('/', isOrganization, async (req, res) => {
  try {
    const listings = await findAllAvailableListings();
    res.status(200).json(listings);
  } catch (error) {
    console.error('Get available listings error:', error);
    res.status(500).json({ message: 'Server error while fetching available listings' });
  }
});

// POST /api/listings - Create a new listing (For Restaurants)
router.post('/', isRestaurant, async (req, res) => {
  try {
    const { foodName, description, quantity, pickupLocation, expiryDate, status } = req.body;
    const restaurantId = req.user.id; // From authenticateToken middleware

    if (!foodName || !description || !quantity || !pickupLocation || !expiryDate) {
      return res.status(400).json({ message: 'Missing required fields: foodName, description, quantity, pickupLocation, expiryDate' });
    }

    const listingData = {
      foodName,
      description,
      quantity: parseInt(quantity, 10), // Ensure quantity is a number
      pickupLocation,
      expiryDate, // Assuming ISO 8601 date string
      status: status || 'available', // Default status
    };

    const newListing = await createListing(listingData, restaurantId);
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error while creating listing' });
  }
});

// GET /api/listings/my-listings - Get listings for the authenticated restaurant
router.get('/my-listings', isRestaurant, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const listings = await findListingsByRestaurantId(restaurantId);
    res.status(200).json(listings);
  } catch (error) {
    console.error('Get my-listings error:', error);
    res.status(500).json({ message: 'Server error while fetching listings' });
  }
});

// PUT /api/listings/:id - Update a listing
router.put('/:id', isRestaurant, async (req, res) => {
  try {
    const listingId = req.params.id;
    const restaurantId = req.user.id;
    const updateData = req.body; // e.g., { foodName, description, quantity, etc. }

    const listing = await findListingById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this listing' });
    }

    // Ensure not to update restaurantId or id
    delete updateData.id;
    delete updateData.restaurantId;
    delete updateData.createdAt; // Should not be updated manually

    const updatedListing = await updateListing(listingId, updateData);
    if (!updatedListing) { // Should be handled by findListingById already
        return res.status(404).json({ message: 'Listing not found or update failed' });
    }
    res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error while updating listing' });
  }
});

// DELETE /api/listings/:id - Delete a listing
router.delete('/:id', isRestaurant, async (req, res) => {
  try {
    const listingId = req.params.id;
    const restaurantId = req.user.id;

    const listing = await findListingById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this listing' });
    }

    const wasDeleted = await deleteListing(listingId);
    if (!wasDeleted) {
      // This might happen if the listing was deleted between findListingById and deleteListing, though unlikely
      return res.status(404).json({ message: 'Listing not found or already deleted' });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error while deleting listing' });
  }
});

// PATCH /api/listings/:id/claim - Claim a listing (For Organizations)
router.patch('/:id/claim', isOrganization, async (req, res) => {
  try {
    const listingId = req.params.id;
    const organizationId = req.user.id; // From authenticateToken middleware

    const listing = await findListingById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'available') {
      return res.status(409).json({ message: `Listing is already ${listing.status}` });
    }

    const claimedListing = await claimListing(listingId, organizationId);

    if (claimedListing && claimedListing.error) { // Handle error from claimListing model function
        return res.status(409).json({ message: claimedListing.error, currentStatus: claimedListing.status });
    }
    if (!claimedListing) { // Should be covered by findListingById, but as a fallback
        return res.status(404).json({ message: 'Listing not found or could not be claimed' });
    }

    res.status(200).json(claimedListing);
  } catch (error) {
    console.error('Claim listing error:', error);
    res.status(500).json({ message: 'Server error while claiming listing' });
  }
});

module.exports = router;
