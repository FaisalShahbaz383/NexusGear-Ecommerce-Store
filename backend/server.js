const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supportRoutes = require('./routes/supportRoutes');
const Product = require('./models/Product');
const seedDB = require('./utils/seedData');

// Establish MongoDB connection
connectDB().then(async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[System Initialization]: Database empty. Auto-seeding initial catalog...');
      // Execute seed logic if freshly mounted
      const User = require('./models/User');
      const Order = require('./models/Order');
      const SupportTicket = require('./models/SupportTicket');
      
      const adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@ecommerce.com',
        password: 'admin123',
        role: 'admin',
      });

      const customerUser = await User.create({
        name: 'John Customer',
        email: 'customer@ecommerce.com',
        password: 'customer123',
        role: 'user',
      });

      console.log('[Auto-Seed]: Initial accounts provisioned.');
    }
  } catch (err) {
    console.warn('[Auto-Seed Warning]:', err.message);
  }
});

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// System Health & Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Operational',
    system: 'Task 4: Secure E-Commerce Engine with Checkout Sandbox',
    version: '1.0.0',
    documentation: '/api/docs',
    timestamp: new Date().toISOString(),
  });
});

// Mount Microservice API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);

// Fallthrough 404 & Global Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[E-Commerce Server]: Engine running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
