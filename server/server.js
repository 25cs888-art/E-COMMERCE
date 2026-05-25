import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import { User, Product } from './models/index.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Seed data function to prepopulate database
const seedDatabase = async () => {
  try {
    // Seed Users
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding initial users...');
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      await User.create({
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        role: 'user'
      });
      console.log('Users seeded successfully! (Admin: admin/admin123, User: user/user123)');
    }

    // Seed Products
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding initial products...');
      const sampleProducts = [
        {
          name: 'Minimalist Leather Backpack',
          description: 'Crafted from premium full-grain leather, this minimalist backpack features a padded 15-inch laptop compartment, quick-access exterior pockets, and comfortable ergonomic shoulder straps. Perfect for daily commutes and weekend adventures.',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
          category: 'Accessories',
          stock: 15
        },
        {
          name: 'Wireless Noise-Canceling Headphones',
          description: 'Experience pure music without distraction. Featuring industry-leading active noise canceling, 30-hour battery life, high-fidelity audio drivers, and a comfortable over-ear design with plush memory foam earcups.',
          price: 199.50,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          category: 'Electronics',
          stock: 10
        },
        {
          name: 'Mechanical Gaming Keyboard',
          description: 'Enhance your gaming and typing experience. Equipped with tactile and clicky mechanical switches, customizable per-key RGB backlighting, durable aluminum top plate, and dedicated media controls.',
          price: 129.00,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
          category: 'Electronics',
          stock: 8
        },
        {
          name: 'Organic Cotton Hoodie',
          description: 'The ultimate comfort wear. Made from 100% certified organic cotton fleece, this heavy-weight hoodie features a relaxed fit, double-lined hood, and a spacious kangaroo pocket. Ethically manufactured.',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
          category: 'Apparel',
          stock: 25
        },
        {
          name: 'Smart Fitness Watch',
          description: 'Track your health and daily activities. Monitors heart rate, sleep quality, and steps. Features 12 built-in sport modes, built-in GPS, smart notifications, and a vibrant AMOLED display with 7-day battery life.',
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
          category: 'Electronics',
          stock: 12
        },
        {
          name: 'Stainless Steel Water Bottle',
          description: 'Stay hydrated in style. This double-walled vacuum insulated bottle keeps drinks ice cold for up to 24 hours or hot for up to 12 hours. Made from food-grade stainless steel, BPA-free, and leak-proof.',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
          category: 'Home & Kitchen',
          stock: 40
        }
      ];
      await Product.bulkCreate(sampleProducts);
      console.log('Products seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Database Sync and Server Startup
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synchronized successfully.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });
export default app;
