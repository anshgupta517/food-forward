const fs = require('fs').promises;
const path = require('path');

// Determine DB path based on environment
const listingsDbFile = process.env.NODE_ENV === 'test' ? 'listings.test.json' : 'listings.json';
const listingsFilePath = path.join(__dirname, '..', 'db', listingsDbFile);

async function readListings() {
  try {
    // await fs.mkdir(path.dirname(listingsFilePath), { recursive: true }); // Usually not needed
    const data = await fs.readFile(listingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return []; // If file doesn't exist or is invalid JSON, return empty array
    }
    throw error;
  }
}

async function writeListings(listings) {
  await fs.writeFile(listingsFilePath, JSON.stringify(listings, null, 2), 'utf8');
}

async function createListing(listingData, restaurantId) {
  const listings = await readListings();
  const newListing = {
    id: Date.now().toString(), // Simple unique ID
    restaurantId,
    ...listingData,
    status: listingData.status || 'available', // Default status
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  listings.push(newListing);
  await writeListings(listings);
  return newListing;
}

async function findListingsByRestaurantId(restaurantId) {
  const listings = await readListings();
  return listings.filter(listing => listing.restaurantId === restaurantId);
}

async function findListingById(listingId) {
  const listings = await readListings();
  return listings.find(listing => listing.id === listingId);
}

async function findAllAvailableListings() {
  const listings = await readListings();
  return listings.filter(listing => listing.status === 'available');
}

async function claimListing(listingId, organizationId) {
  const listings = await readListings();
  const index = listings.findIndex(listing => listing.id === listingId);
  if (index === -1) {
    return null; // Listing not found
  }
  if (listings[index].status !== 'available') {
    return { error: 'Listing is not available for claiming.', status: listings[index].status };
  }
  listings[index] = {
    ...listings[index],
    status: 'claimed',
    organizationId: organizationId,
    claimedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeListings(listings);
  return listings[index];
}

async function updateListing(listingId, updateData) {
  const listings = await readListings();
  const index = listings.findIndex(listing => listing.id === listingId);
  if (index === -1) {
    return null; // Or throw an error
  }
  listings[index] = {
    ...listings[index],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  await writeListings(listings);
  return listings[index];
}

async function deleteListing(listingId) {
  let listings = await readListings();
  const initialLength = listings.length;
  listings = listings.filter(listing => listing.id !== listingId);
  if (listings.length === initialLength) {
    return false; // No listing found or deleted
  }
  await writeListings(listings);
  return true; // Successfully deleted
}

module.exports = {
  createListing,
  findListingsByRestaurantId,
  findListingById,
  findAllAvailableListings, // Added
  claimListing, // Added
  updateListing,
  deleteListing,
  readListings,
};
