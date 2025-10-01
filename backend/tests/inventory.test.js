const request = require('supertest');
const { generateToken } = require('../middleware/auth');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() },
  initDatabase: jest.fn()
}));

const { query } = require('../config/database');
const app = require('../server');

describe('Inventory Routes', () => {
  let userToken;
  let adminToken;

  beforeAll(() => {
    userToken = generateToken({ id: 1, username: 'user', role: 'user' });
    adminToken = generateToken({ id: 2, username: 'admin', role: 'admin' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inventory', () => {
    it('should fetch all inventory items with authentication', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, item_name: 'Camiseta', category: 'ropa', quantity: 10 },
          { id: 2, item_name: 'Zapatos', category: 'calzado', quantity: 5 }
        ]
      });

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.inventory).toHaveLength(2);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/inventory');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/inventory', () => {
    it('should allow admin to create inventory item', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          item_name: 'Pantalón',
          category: 'ropa',
          quantity: 15,
          size: 'M'
        }]
      });

      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          item_name: 'Pantalón',
          category: 'ropa',
          quantity: 15,
          size: 'M'
        });

      expect(response.status).toBe(201);
      expect(response.body.item.item_name).toBe('Pantalón');
    });

    it('should reject non-admin from creating items', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          item_name: 'Pantalón',
          category: 'ropa',
          quantity: 15
        });

      expect(response.status).toBe(403);
    });

    it('should reject item with missing fields', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          item_name: 'Pantalón'
        });

      expect(response.status).toBe(400);
    });

    it('should reject item with negative quantity', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          item_name: 'Pantalón',
          category: 'ropa',
          quantity: -5
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/inventory/:id', () => {
    it('should allow admin to update inventory item', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          item_name: 'Camiseta Actualizada',
          category: 'ropa',
          quantity: 20
        }]
      });

      const response = await request(app)
        .put('/api/inventory/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          item_name: 'Camiseta Actualizada',
          category: 'ropa',
          quantity: 20
        });

      expect(response.status).toBe(200);
      expect(response.body.item.quantity).toBe('20');
    });

    it('should return 404 for non-existent item', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/inventory/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          item_name: 'Test',
          category: 'ropa',
          quantity: 10
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should allow admin to delete inventory item', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .delete('/api/inventory/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject non-admin from deleting', async () => {
      const response = await request(app)
        .delete('/api/inventory/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/inventory/:id', () => {
    it('should fetch specific inventory item', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          item_name: 'Camiseta',
          category: 'ropa',
          quantity: 10,
          size: 'M'
        }]
      });

      const response = await request(app)
        .get('/api/inventory/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.item.item_name).toBe('Camiseta');
    });

    it('should return 404 for non-existent item', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/inventory/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });
});