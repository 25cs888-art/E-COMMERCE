import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class CartItem extends Model {}

CartItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  sequelize,
  modelName: 'CartItem',
  tableName: 'cart_items'
});

export default CartItem;
