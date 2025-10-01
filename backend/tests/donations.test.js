const request = require('supertest');
const { generateToken } = require('../middleware/auth');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() },
  initDatabase: jest.fn()
}));

const { query } = require('../config/database');
const app = require('../server');

describe('Donation Routes', () => {
  let userToken;
  let adminToken;

  beforeAll(() => {
    userToken = generateToken({ id: 1, username: 'user', role: 'user' });
    adminToken = generateToken({ id: 2, username: 'admin', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/donations/received', () => {
    it('should create a donation with valid data', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          user_id: 1,
          amount: 100,
          description: 'Test donation',
          date: new Date()
        }]
      });

      const response = await request(app)
        .post('/api/donations/received')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 100,
          description: 'Test donation'
        });

      expect(response.status).toBe(201);
      expect(response.body.donation.amount).toBe('100');
    });

    it('should reject donation with invalid amount', async () => {
      const response = await request(app)
        .post('/api/donations/received')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: -50,
          description: 'Invalid donation'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Valid amount');
    });

    it('should reject donation without authentication', async () => {
      const response = await request(app)
        .post('/api/donations/received')
        .send({
          amount: 100,
          description: 'Test donation'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/donations/received', () => {
    it('should fetch all donations with authentication', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, amount: 100, description: 'Donation 1', username: 'user1' },
          { id: 2, amount: 50, description: 'Donation 2', username: 'user2' }
        ]
      });

      const response = await request(app)
        .get('/api/donations/received')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.donations).toHaveLength(2);
    });
  });

  describe('POST /api/donations/requests', () => {
    it('should create a donation request with valid data', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          user_id: 1,
          item_type: 'ropa',
          quantity: 5,
          reason: 'Need help',
          status: 'pending'
        }]
      });

      const response = await request(app)
        .post('/api/donations/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          item_type: 'ropa',
          quantity: 5,
          reason: 'Need help'
        });

      expect(response.status).toBe(201);
      expect(response.body.request.item_type).toBe('ropa');
    });

    it('should reject request with invalid quantity', async () => {
      const response = await request(app)
        .post('/api/donations/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          item_type: 'ropa',
          quantity: 0,
          reason: 'Need help'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/donations/requests/:id', () => {
    it('should allow admin to update request status', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          status: 'approved'
        }]
      });

      const response = await request(app)
        .patch('/api/donations/requests/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved'
        });

      expect(response.status).toBe(200);
      expect(response.body.request.status).toBe('approved');
    });

    it('should reject non-admin user from updating status', async () => {
      const response = await request(app)
        .patch('/api/donations/requests/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'approved'
        });

      expect(response.status).toBe(403);
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .patch('/api/donations/requests/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'invalid_status'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/donations/received/:id', () => {
    it('should allow admin to delete donation', async () => {
      query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      const response = await request(app)
        .delete('/api/donations/received/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject non-admin from deleting', async () => {
      const response = await request(app)
        .delete('/api/donations/received/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});