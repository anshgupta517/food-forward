const request = require('supertest');
const app = require('../index'); // Make sure your Express app is exported from server/index.js
const fs = require('fs').promises;
const path = require('path');

const USERS_DB_PATH = path.join(__dirname, '..', 'db', 'users.test.json');
// const LISTINGS_DB_PATH = path.join(__dirname, '..', 'db', 'listings.test.json'); // Not used in this file

// Set NODE_ENV to 'test' - Jest should do this, but good to be explicit if needed elsewhere
// process.env.NODE_ENV = 'test'; // Jest CLI sets this automatically

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Reset users database before each test
    await fs.writeFile(USERS_DB_PATH, JSON.stringify([]));
    // Reset listings database if auth tests indirectly affect it (not typical)
    // await fs.writeFile(LISTINGS_DB_PATH, JSON.stringify([]));
  });

  // Test for POST /api/auth/register
  describe('POST /api/auth/register', () => {
    it('should register a new restaurant user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Restaurant',
          email: 'restaurant@example.com',
          password: 'password123',
          userType: 'restaurant',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body.user).toHaveProperty('email', 'restaurant@example.com');
      expect(res.body.user).toHaveProperty('userType', 'restaurant');
      expect(res.body.user).not.toHaveProperty('password');

      const users = JSON.parse(await fs.readFile(USERS_DB_PATH, 'utf8'));
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('restaurant@example.com');
    });

    it('should register a new organization user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Organization',
          email: 'org@example.com',
          password: 'password123',
          userType: 'organization',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty('email', 'org@example.com');
      expect(res.body.user).toHaveProperty('userType', 'organization');
    });

    it('should fail to register with an existing email', async () => {
      // First, register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password123',
          userType: 'restaurant',
        });
      
      // Attempt to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'password456',
          userType: 'organization',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User with this email already exists');
    });

    it('should fail to register with missing fields (e.g., email)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          // email: 'missing@example.com', // Email is missing
          password: 'password123',
          userType: 'restaurant',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'All fields are required: email, password, name, userType');
    });

     it('should fail to register with invalid userType', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Type User',
          email: 'invalidtype@example.com',
          password: 'password123',
          userType: 'admin', // Invalid user type
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'userType must be either "restaurant" or "organization"');
    });
  });

  // Test for POST /api/auth/login
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user to test login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'password123',
          userType: 'restaurant',
        });
    });

    it('should login an existing user successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail to login with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail to login with a non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401); // Or 404 depending on how you implemented it, 401 for "Invalid credentials" is common
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail to login with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          // email: 'login@example.com', // Missing email
          password: 'password123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email and password are required');
    });
  });
});
