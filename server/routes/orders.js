import express from 'express';
import { Order, OrderItem, CartItem, Product, User } from '../models/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import sequelize from '../config/db.js';

const router = express.Router();

// Create order (Checkout)
router.post('/', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get user's cart items
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [Product],
      transaction: t
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // Verify stock and calculate total
    for (const item of cartItems) {
      const product = item.Product;
      if (!product) {
        return res.status(400).json({ message: 'One of the items in your cart is no longer available.' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create Order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      status: 'Pending',
      paymentStatus: 'Paid',
      paymentMethod: 'Card'
    }, { transaction: t });

    // Create Order Items and decrease product stock
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        productId: itemData.productId,
        quantity: itemData.quantity,
        price: itemData.price
      }, { transaction: t });

      const product = await Product.findByPk(itemData.productId, { transaction: t });
      product.stock -= itemData.quantity;
      await product.save({ transaction: t });
    }

    // Clear user's cart
    await CartItem.destroy({
      where: { userId: req.user.id },
      transaction: t
    });

    await t.commit();

    // Reload order with its items and products
    const completedOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    res.status(201).json({ message: 'Order placed successfully', order: completedOrder });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
});

// Get orders (Admins see all, Users see only their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.findAll({
        include: [
          { model: User, attributes: ['id', 'username', 'email'] },
          { model: OrderItem, include: [Product] }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      orders = await Order.findAll({
        where: { userId: req.user.id },
        include: [{ model: OrderItem, include: [Product] }],
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
});

// Get single order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: OrderItem, include: [Product] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Enforce authorization
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only view your own orders' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve order details', error: error.message });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Fetch the updated order with items
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: OrderItem, include: [Product] }
      ]
    });

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

export default router;
