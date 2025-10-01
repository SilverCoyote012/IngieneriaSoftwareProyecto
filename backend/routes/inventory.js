const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM inventory ORDER BY category, item_name'
    );

    res.json({ inventory: result.rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Error fetching inventory' });
  }
});

// Obtener un item específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM inventory WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Error fetching item' });
  }
});

// Crear item de inventario (solo admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { item_name, category, quantity, size } = req.body;

    if (!item_name || !category) {
      return res.status(400).json({ error: 'Item name and category are required' });
    }

    if (quantity && quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const result = await query(
      'INSERT INTO inventory (item_name, category, quantity, size) VALUES ($1, $2, $3, $4) RETURNING *',
      [item_name, category, quantity || 0, size || '']
    );

    res.status(201).json({
      message: 'Item created successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Error creating item' });
  }
});

// Actualizar item de inventario (solo admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, category, quantity, size } = req.body;

    if (!item_name || !category) {
      return res.status(400).json({ error: 'Item name and category are required' });
    }

    if (quantity && quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const result = await query(
      'UPDATE inventory SET item_name = $1, category = $2, quantity = $3, size = $4, last_updated = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [item_name, category, quantity || 0, size || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({
      message: 'Item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Error updating item' });
  }
});

// Eliminar item de inventario (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM inventory WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Error deleting item' });
  }
});

module.exports = router;