import express from 'express';
import { Product } from '../models/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all products (with optional search, category filter, and sorting)
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let whereClause = {};

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [['id', 'DESC']];
    if (sort) {
      if (sort === 'price_asc') order = [['price', 'ASC']];
      else if (sort === 'price_desc') order = [['price', 'DESC']];
      else if (sort === 'name_asc') order = [['name', 'ASC']];
      else if (sort === 'name_desc') order = [['name', 'DESC']];
    }

    const products = await Product.findAll({
      where: whereClause,
      order: order
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve product', error: error.message });
  }
});

// Create product (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock: stock !== undefined ? stock : 0
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      name: name !== undefined ? name : product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      image: image !== undefined ? image : product.image,
      category: category !== undefined ? category : product.category,
      stock: stock !== undefined ? stock : product.stock
    });

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

export default router;
