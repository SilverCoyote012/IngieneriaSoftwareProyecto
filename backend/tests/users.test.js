const request = require('supertest');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() },
  initDatabase: jest.fn()
}));

const { query } = require('../config/database');
const app = require('../server');

describe('User Routes', () => {
  let userToken;
  let adminToken;

  beforeAll(() => {
    userToken = generateToken({ id: 1, username: 'user', role: 'user' });
    adminToken = generateToken({ id: 2, username: 'admin', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should allow admin to fetch all users', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, username: 'user1', email: 'user1@test.com', role: 'user' },
          { id: 2, username: 'admin', email: 'admin@test.com', role: 'admin' }
        ]
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(2);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should allow admin to fetch specific user', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@test.com',
          role: 'user'
        }]
      });

      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('testuser');
    });

    it('should return 404 for non-existent user', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow admin to update user', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'updateduser',
          email: 'updated@test.com',
          role: 'user'
        }]
      });

      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'updateduser',
          email: 'updated@test.com',
          role: 'user'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('updateduser');
    });

    it('should reject update with missing fields', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'test'
        });

      expect(response.status).toBe(400);
    });

    it('should reject update with invalid role', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'test',
          email: 'test@test.com',
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'test',
          email: 'test@test.com'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot delete your own account');
    });

    it('should return 404 for non-existent user', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/users/change-password', () => {
    it('should allow user to change their password', async () => {
      const hashedPassword = await bcrypt.hash('oldpassword', 10);
      
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          password: hashedPassword
        }]
      });
      query.mockResolvedValueOnce({ rows: [] }); // Update query

      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password changed');
    });

    it('should reject password change with incorrect current password', async () => {
      const hashedPassword = await bcrypt.hash('oldpassword', 10);
      
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          password: hashedPassword
        }]
      });

      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(401);
    });

    it('should reject password change with short new password', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'oldpassword',
          newPassword: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 6 characters');
    });

    it('should reject password change with missing fields', async () => {
      const response = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'oldpassword'
        });

      expect(response.status).toBe(400);
    });
  });
});