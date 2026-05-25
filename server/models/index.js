import User from './User.js';
import Product from './Product.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';

// User <-> CartItem (One-to-Many)
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Product <-> CartItem (One-to-Many)
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// User <-> Order (One-to-Many)
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order <-> OrderItem (One-to-Many)
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem (One-to-Many)
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'SET NULL' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export {
  User,
  Product,
  CartItem,
  Order,
  OrderItem
};
