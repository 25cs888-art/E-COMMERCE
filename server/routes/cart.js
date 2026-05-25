import express from 'express';
import { CartItem, Product } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get logged-in user's cart items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'image', 'stock', 'category']
      }],
      order: [['id', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load cart items', error: error.message });
  }
});

// Add item to cart or update quantity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
    }

    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId }
    });

    if (cartItem) {
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity
      });
    }

    const reloaded = await CartItem.findByPk(cartItem.id, {
      include: [Product]
    });

    res.json({ message: 'Cart updated successfully', cartItem: reloaded });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});

// Remove item from cart
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const rowsDeleted = await CartItem.destroy({
      where: { userId: req.user.id, productId: req.params.productId }
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await CartItem.destroy({
      where: { userId: req.user.id }
    });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

export default router;
