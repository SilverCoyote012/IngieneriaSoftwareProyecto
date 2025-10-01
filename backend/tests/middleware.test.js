const jwt = require('jsonwebtoken');
const {
  authenticateToken,
  requireAdmin,
  requireUser,
  generateToken,
  JWT_SECRET
} = require('../middleware/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const user = { id: 1, username: 'test', role: 'user' };
      const token = generateToken(user);
      req.headers['authorization'] = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.username).toBe('test');
    });

    it('should reject request without token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      req.headers['authorization'] = 'Bearer invalid_token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      const token = jwt.sign(
        { id: 1, username: 'test', role: 'user' },
        JWT_SECRET,
        { expiresIn: '-1h' } // Token expirado
      );
      req.headers['authorization'] = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin users', () => {
      req.user = { id: 1, username: 'admin', role: 'admin' };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject non-admin users', () => {
      req.user = { id: 1, username: 'user', role: 'user' };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireUser', () => {
    it('should allow regular users', () => {
      req.user = { id: 1, username: 'user', role: 'user' };

      requireUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow admin users', () => {
      req.user = { id: 1, username: 'admin', role: 'admin' };

      requireUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject users without proper role', () => {
      req.user = { id: 1, username: 'test', role: 'invalid' };

      requireUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const user = { id: 1, username: 'test', role: 'user' };
      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verificar que el token puede ser decodificado
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(user.id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.role).toBe(user.role);
    });

    it('should include expiration in token', () => {
      const user = { id: 1, username: 'test', role: 'user' };
      const token = generateToken(user);

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });
});