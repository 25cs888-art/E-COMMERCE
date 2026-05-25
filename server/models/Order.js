import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
    validate: {
      isIn: [['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']]
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Paid',
    validate: {
      isIn: [['Pending', 'Paid', 'Failed', 'Refunded']]
    }
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Card'
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders'
});

export default Order;
