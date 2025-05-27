const request = require('supertest');
const app = require('../index'); // Your Express app
const fs = require('fs').promises;
const path = require('path');

const USERS_DB_PATH = path.join(__dirname, '..', 'db', 'users.test.json');
const LISTINGS_DB_PATH = path.join(__dirname, '..', 'db', 'listings.test.json');

let restaurantToken;
let organizationToken;
let restaurantUser;
let organizationUser;
let createdListingId;

// Helper function to register and login a user, returns token and user object
async function registerAndLoginUser(name, email, password, userType) {
  await request(app)
    .post('/api/auth/register')
    .send({ name, email, password, userType });
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  return { token: loginRes.body.token, user: loginRes.body.user };
}

describe('Listing Endpoints', () => {
  beforeAll(async () => {
    // Set up users and tokens once for all tests in this suite
    const restaurantData = await registerAndLoginUser('Test Restaurant', 'resto@test.com', 'password123', 'restaurant');
    restaurantToken = restaurantData.token;
    restaurantUser = restaurantData.user;

    const orgData = await registerAndLoginUser('Test Organization', 'org@test.com', 'password123', 'organization');
    organizationToken = orgData.token;
    organizationUser = orgData.user;
  });
  
  beforeEach(async () => {
    // Reset listings database before each test, but keep users
    await fs.writeFile(LISTINGS_DB_PATH, JSON.stringify([]));
  });

  // Restaurant Flow
  describe('Restaurant Listing Management', () => {
    it('POST /api/listings - should create a listing for an authenticated restaurant', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          foodName: 'Surplus Pizza',
          description: 'Delicious cheese pizza',
          quantity: 10,
          pickupLocation: '123 Main St',
          expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires tomorrow
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.foodName).toBe('Surplus Pizza');
      expect(res.body.restaurantId).toBe(restaurantUser.id);
      createdListingId = res.body.id; // Save for later tests
    });

    it('POST /api/listings - should fail to create listing with missing fields', async () => {
        const res = await request(app)
          .post('/api/listings')
          .set('Authorization', `Bearer ${restaurantToken}`)
          .send({
            // foodName: 'Incomplete Pizza', // Missing foodName
            description: 'This will fail',
            quantity: 5,
            pickupLocation: 'Missing St',
            expiryDate: new Date().toISOString(),
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Missing required fields: foodName, description, quantity, pickupLocation, expiryDate');
    });
    
    it('POST /api/listings - should forbid an organization from creating a listing', async () => {
      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${organizationToken}`) // Use organization token
        .send({
          foodName: 'Org Pizza Attempt',
          description: 'This should not work',
          quantity: 5,
          pickupLocation: 'Org Address',
          expiryDate: new Date().toISOString(),
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Access denied. Restaurant role required.');
    });

    it('GET /api/listings/my-listings - should retrieve listings for the authenticated restaurant', async () => {
       // First, create a listing
      await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ foodName: 'My Pizza', description: 'A pizza I own', quantity: 1, pickupLocation: 'My Place', expiryDate: new Date().toISOString() });

      const res = await request(app)
        .get('/api/listings/my-listings')
        .set('Authorization', `Bearer ${restaurantToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].restaurantId).toBe(restaurantUser.id);
    });
    
    it('PUT /api/listings/:id - should update a listing for the owning restaurant', async () => {
      // Create a listing first
      const creationRes = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ foodName: 'Old Name', description: 'Old Desc', quantity: 1, pickupLocation: 'Old Loc', expiryDate: new Date().toISOString() });
      const listingId = creationRes.body.id;

      const res = await request(app)
        .put(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ foodName: 'New Updated Name', quantity: 2 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.foodName).toBe('New Updated Name');
      expect(res.body.quantity).toBe(2);
    });

    it('PUT /api/listings/:id - should forbid updating a listing not owned by the restaurant', async () => {
      // Create a listing with restaurantUser
      const creationRes = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ foodName: 'Belongs to Resto1', description: 'Desc', quantity: 1, pickupLocation: 'Loc', expiryDate: new Date().toISOString() });
      const listingId = creationRes.body.id;

      // Register and login another restaurant
      const otherRestaurantData = await registerAndLoginUser('Other Restaurant', 'otherresto@test.com', 'password123', 'restaurant');
      
      const res = await request(app)
        .put(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${otherRestaurantData.token}`) // Use other restaurant's token
        .send({ foodName: 'Attempted Update' });
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Forbidden: You do not own this listing');
    });

    it('DELETE /api/listings/:id - should delete a listing for the owning restaurant', async () => {
      const creationRes = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ foodName: 'To Be Deleted', description: 'Desc', quantity: 1, pickupLocation: 'Loc', expiryDate: new Date().toISOString() });
      const listingId = creationRes.body.id;

      const res = await request(app)
        .delete(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${restaurantToken}`);
      expect(res.statusCode).toEqual(204); // No Content
    });
  });

  // Organization Flow
  describe('Organization Listing Interaction', () => {
    let availableListingId;
    beforeEach(async () => {
      // Ensure there's an available listing created by the restaurant user
      const listingRes = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({
          foodName: 'Available Food',
          description: 'Ready for pickup',
          quantity: 5,
          pickupLocation: 'Restaurant Place',
          expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        });
      availableListingId = listingRes.body.id;
    });

    it('GET /api/listings - should retrieve available listings for an organization', async () => {
      const res = await request(app)
        .get('/api/listings')
        .set('Authorization', `Bearer ${organizationToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      const availableFoodListing = res.body.find(l => l.id === availableListingId);
      expect(availableFoodListing).toBeDefined();
      expect(availableFoodListing.status).toBe('available');
    });
    
    it('GET /api/listings - should be forbidden for a restaurant (or handle differently)', async () => {
      // According to current implementation, /api/listings is for organizations.
      // Restaurants use /api/listings/my-listings
      const res = await request(app)
        .get('/api/listings')
        .set('Authorization', `Bearer ${restaurantToken}`);
      expect(res.statusCode).toEqual(403); // Assuming it's forbidden for restaurants
      expect(res.body).toHaveProperty('message', 'Access denied. Organization role required.');
    });

    it('PATCH /api/listings/:id/claim - should allow an organization to claim an available listing', async () => {
      const res = await request(app)
        .patch(`/api/listings/${availableListingId}/claim`)
        .set('Authorization', `Bearer ${organizationToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('claimed');
      expect(res.body.organizationId).toBe(organizationUser.id);
    });

    it('PATCH /api/listings/:id/claim - should forbid claiming a listing that is already claimed', async () => {
      // First, org claims the listing
      await request(app)
        .patch(`/api/listings/${availableListingId}/claim`)
        .set('Authorization', `Bearer ${organizationToken}`);
      
      // Attempt to claim again by the same or another org (register new org for this)
      const otherOrgData = await registerAndLoginUser('Another Org', 'otherorg@test.com', 'password123', 'organization');

      const res = await request(app)
        .patch(`/api/listings/${availableListingId}/claim`)
        .set('Authorization', `Bearer ${otherOrgData.token}`);
      expect(res.statusCode).toEqual(409); // Conflict
      expect(res.body).toHaveProperty('message', 'Listing is already claimed');
    });
    
    it('PATCH /api/listings/:id/claim - should forbid a restaurant from claiming a listing', async () => {
      const res = await request(app)
        .patch(`/api/listings/${availableListingId}/claim`)
        .set('Authorization', `Bearer ${restaurantToken}`); // Restaurant token
      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Access denied. Organization role required.');
    });
  });
});
