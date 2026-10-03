const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SupportTicket = require('../models/SupportTicket');

dotenv.config({ path: __dirname + '/../.env' });

const sampleProducts = [
  {
    title: 'Aura Pro Noise-Cancelling Headphones',
    description: 'Engineered for audio purists. Custom-tuned 40mm drivers deliver rich, expansive fidelity with 3-stage adaptive active noise cancellation and 40-hour battery life.',
    price: 299.99,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    countInStock: 15,
    rating: 4.8,
    numReviews: 12,
    reviews: [
      {
        name: 'Alex Mercer',
        rating: 5,
        comment: 'Mind-blowing acoustic separation and deep bass without distortion!',
      },
    ],
  },
  {
    title: 'Titan Chrono Smartwatch Ultra',
    description: 'Rugged titanium casing with a scratch-resistant sapphire crystal display, dual-frequency GPS, biometric sensors, and waterproof depth rating down to 100 meters.',
    price: 399.00,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    countInStock: 8,
    rating: 4.7,
    numReviews: 9,
    reviews: [],
  },
  {
    title: 'Apex Mechanical Gaming Keyboard (RGB)',
    description: 'Precision hot-swappable tactile mechanical switches, aircraft-grade anodized aluminum frame, per-key RGB backlighting, and magnetic memory foam wrist rest.',
    price: 149.50,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    countInStock: 3, // Low stock alert!
    rating: 4.9,
    numReviews: 16,
    reviews: [],
  },
  {
    title: 'Zenith 4K UHD Ultra-Wide Monitor 34"',
    description: 'Immersive 1500R curved HDR400 display with 165Hz refresh rate, 1ms response time, and 99% sRGB color gamut coverage. Ideal for creators and competitive gaming.',
    price: 549.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    countInStock: 4, // Low stock alert!
    rating: 4.6,
    numReviews: 7,
    reviews: [],
  },
  {
    title: 'Nomad Tech Sling & Weatherproof Messenger',
    description: 'Water-resistant Cordura ballistic nylon exterior, magnetic Fidlock buckle, padded tablet sleeve, and hidden RFID-blocking passport pocket.',
    price: 89.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    countInStock: 22,
    rating: 4.5,
    numReviews: 5,
    reviews: [],
  },
  {
    title: 'Pulse Studio Wireless Earbuds',
    description: 'Ultra-compact high-res wireless earbuds featuring beryllium dynamic drivers, spatial audio tracking, transparency pass-through mode, and wireless charging case.',
    price: 179.99,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    countInStock: 18,
    rating: 4.6,
    numReviews: 8,
    reviews: [],
  },
  {
    title: 'Vanguard Cyber Ergonomic Chair',
    description: 'Breathable composite mesh, 4D adjustable armrests, adaptive dynamic lumbar support, and heavy-duty steel base rated for all-day focus and posture alignment.',
    price: 429.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800&auto=format&fit=crop',
    countInStock: 6,
    rating: 4.7,
    numReviews: 11,
    reviews: [],
  },
  {
    title: 'Phantom Ultra-Lightweight Wireless Mouse',
    description: 'Sub-60g honeycomb chassis, 26,000 DPI optical sensor, optical switches rated for 90 million clicks, and zero-drag paracord charging cable.',
    price: 79.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    countInStock: 2, // Low stock alert!
    rating: 4.8,
    numReviews: 14,
    reviews: [],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_ecommerce_sandbox');
    console.log('[Seed Engine]: Connected to MongoDB');

    // Clear existing records
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await SupportTicket.deleteMany();
    console.log('[Seed Engine]: Cleared old collection data');

    // Create Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create Sample Customer User
    const customerUser = await User.create({
      name: 'John Customer',
      email: 'customer@ecommerce.com',
      password: 'customer123',
      role: 'user',
    });

    console.log('[Seed Engine]: Users created (admin@ecommerce.com, customer@ecommerce.com)');

    // Assign admin or sample user as review creator
    const productsWithReviews = sampleProducts.map((p) => {
      const copy = { ...p };
      if (copy.reviews && copy.reviews.length > 0) {
        copy.reviews = copy.reviews.map((r) => ({
          ...r,
          user: customerUser._id,
        }));
      }
      return copy;
    });

    const createdProducts = await Product.insertMany(productsWithReviews);
    console.log(`[Seed Engine]: Seeded ${createdProducts.length} high-fidelity products`);

    // Create Initial Demo Order
    const sampleOrder = await Order.create({
      user: customerUser._id,
      orderItems: [
        {
          title: createdProducts[0].title,
          qty: 1,
          imageUrl: createdProducts[0].imageUrl,
          price: createdProducts[0].price,
          product: createdProducts[0]._id,
        },
        {
          title: createdProducts[4].title,
          qty: 1,
          imageUrl: createdProducts[4].imageUrl,
          price: createdProducts[4].price,
          product: createdProducts[4]._id,
        },
      ],
      shippingAddress: {
        fullName: 'John Customer',
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        postalCode: '97477',
        country: 'United States',
      },
      paymentMethod: 'Stripe',
      paymentResult: {
        id: 'pi_demo_sandbox_seed_001',
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: 'customer@ecommerce.com',
      },
      itemsPrice: 388.99,
      taxPrice: 31.12,
      shippingPrice: 0.00,
      totalPrice: 420.11,
      paymentStatus: 'Paid',
      isPaid: true,
      paidAt: new Date(Date.now() - 3600000 * 24),
      fulfillmentStatus: 'Shipped',
      isDelivered: false,
    });

    // Create Initial Support Tickets
    await SupportTicket.create([
      {
        user: customerUser._id,
        name: 'John Customer',
        email: 'customer@ecommerce.com',
        subject: 'Tracking number inquiry for Order #' + sampleOrder._id.toString().slice(-6),
        category: 'Order Issue',
        message: 'Hello, could you provide the carrier tracking code for my recent headphones order? Thank you!',
        status: 'Open',
      },
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@sky.net',
        subject: 'Titan Chrono Smartwatch Water Resistance in Salt Water',
        category: 'Product Question',
        message: 'Can I wear the Titan Chrono while diving in salt water reefs, and does the warranty cover it?',
        status: 'In Progress',
        adminResponse: 'Yes, the Titan Chrono is rated up to 100m in saltwater. We recommend rinsing with fresh tap water after ocean dives.',
        respondedAt: new Date(),
      },
    ]);

    console.log('[Seed Engine]: Initial orders and support inquiries successfully generated');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('Admin Account:    admin@ecommerce.com    / admin123');
    console.log('Customer Account: customer@ecommerce.com / customer123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Engine Error]: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
