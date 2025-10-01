const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear donación recibida (usuario dona a la asociación)
router.post('/received', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const result = await query(
      'INSERT INTO donations_received (user_id, amount, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, amount, description || '']
    );

    res.status(201).json({
      message: 'Donation recorded successfully',
      donation: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Error recording donation' });
  }
});

// Obtener todas las donaciones recibidas
router.get('/received', async (req, res) => {
  try {
    const result = await query(`
      SELECT dr.*, u.username 
      FROM donations_received dr
      JOIN users u ON dr.user_id = u.id
      ORDER BY dr.date DESC
    `);

    res.json({ donations: result.rows });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Error fetching donations' });
  }
});

// Crear solicitud de donación (usuario solicita ayuda)
router.post('/requests', async (req, res) => {
  try {
    const { item_type, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!item_type || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Item type and valid quantity are required' });
    }

    const result = await query(
      'INSERT INTO donation_requests (user_id, item_type, quantity, reason, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, item_type, quantity, reason || '', 'pending']
    );

    res.status(201).json({
      message: 'Donation request created successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating donation request:', error);
    res.status(500).json({ error: 'Error creating donation request' });
  }
});

// Obtener todas las solicitudes de donación
router.get('/requests', async (req, res) => {
  try {
    const result = await query(`
      SELECT dr.*, u.username 
      FROM donation_requests dr
      JOIN users u ON dr.user_id = u.id
      ORDER BY dr.date DESC
    `);

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Error fetching donation requests:', error);
    res.status(500).json({ error: 'Error fetching donation requests' });
  }
});

// Actualizar estado de solicitud (solo admin)
router.patch('/requests/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      'UPDATE donation_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      message: 'Request updated successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Error updating request' });
  }
});

// Eliminar donación recibida (solo admin)
router.delete('/received/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM donations_received WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ error: 'Error deleting donation' });
  }
});

// Eliminar solicitud de donación (solo admin)
router.delete('/requests/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM donation_requests WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Error deleting request' });
  }
});

module.exports = router;