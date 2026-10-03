const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create new order and deduct inventory stock upon payment
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult,
      isPaid,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items specified' });
    }

    // 1. Verify all items exist and have sufficient stock before processing
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.title} no longer exists` });
      }
      if (product.countInStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient inventory for ${product.title}. Remaining stock: ${product.countInStock}`,
        });
      }
    }

    // 2. Create the order
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || 'Stripe',
      paymentResult: paymentResult || {
        id: `sim_tx_${Date.now()}`,
        status: isPaid ? 'succeeded' : 'pending',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
      },
      itemsPrice: Number(itemsPrice),
      taxPrice: Number(taxPrice),
      shippingPrice: Number(shippingPrice),
      totalPrice: Number(totalPrice),
      isPaid: Boolean(isPaid),
      paidAt: isPaid ? Date.now() : null,
      paymentStatus: isPaid ? 'Paid' : 'Pending',
      fulfillmentStatus: 'Processing',
    });

    const createdOrder = await order.save();

    // 3. Atomically synchronize inventory: deduct purchased quantities from MongoDB Product stock
    if (isPaid) {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: -item.qty },
        });
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('[Create Order Error]:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'title imageUrl countInStock');

    if (order) {
      // Allow if requester is the order owner or an admin
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order fulfillment status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderFulfillmentStatus = async (req, res) => {
  try {
    const { fulfillmentStatus } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered'];

    if (!validStatuses.includes(fulfillmentStatus)) {
      return res.status(400).json({ message: 'Invalid fulfillment status' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.fulfillmentStatus = fulfillmentStatus;
      if (fulfillmentStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      } else {
        order.isDelivered = false;
        order.deliveredAt = null;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin dashboard metrics
// @route   GET /api/orders/metrics
// @access  Private/Admin
const getDashboardMetrics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const totalUsers = await User.countDocuments();
    const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } }).select('title countInStock price category imageUrl');
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalUsers,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderFulfillmentStatus,
  getDashboardMetrics,
};
