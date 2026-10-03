const stripe = require('../config/stripe');
const Product = require('../models/Product');

// @desc    Get Stripe publishable config
// @route   GET /api/checkout/config
// @access  Public
const getCheckoutConfig = async (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51MockStripePubKeyForSandboxCheckoutDemo001',
    isSandbox: !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('Mock'),
  });
};

// @desc    Create Stripe Payment Intent with server-side price calculation
// @route   POST /api/checkout/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for checkout' });
    }

    // Server-side recalculation of totals by querying DB directly
    let calculatedItemsPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item._id);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product || item._id} not found` });
      }

      if (product.countInStock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.title}". Requested: ${item.qty}, Available: ${product.countInStock}`,
        });
      }

      calculatedItemsPrice += product.price * item.qty;
      validatedItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: item.qty,
      });
    }

    // Standard e-commerce taxation & shipping rules
    calculatedItemsPrice = Number(calculatedItemsPrice.toFixed(2));
    const taxPrice = Number((calculatedItemsPrice * 0.08).toFixed(2)); // 8% sales tax
    const shippingPrice = calculatedItemsPrice > 100 ? 0.00 : 15.00; // Free shipping over $100
    const totalPrice = Number((calculatedItemsPrice + taxPrice + shippingPrice).toFixed(2));

    const amountInCents = Math.round(totalPrice * 100);

    let clientSecret = '';
    let isSandbox = false;

    // Attempt Stripe live test payment intent creation
    if (stripe && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('Mock')) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          description: `Checkout Sandbox Order - ${req.user ? req.user.email : 'Guest'}`,
          metadata: {
            userId: req.user ? req.user._id.toString() : 'guest',
            totalItems: validatedItems.length.toString(),
            totalPrice: totalPrice.toString(),
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        clientSecret = paymentIntent.client_secret;
      } catch (stripeErr) {
        console.warn('[Stripe API Notice]: Live sandbox API call failed, falling back to instant sandbox simulation:', stripeErr.message);
        isSandbox = true;
        clientSecret = `pi_sandbox_${Date.now()}_secret_${Math.random().toString(36).substring(2, 12)}`;
      }
    } else {
      // Offline/demo sandbox mode
      isSandbox = true;
      clientSecret = `pi_sandbox_${Date.now()}_secret_${Math.random().toString(36).substring(2, 12)}`;
    }

    res.json({
      clientSecret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51MockStripePubKeyForSandboxCheckoutDemo001',
      isSandbox,
      pricing: {
        itemsPrice: calculatedItemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      },
      validatedItems,
    });
  } catch (error) {
    console.error('[Create Payment Intent Error]:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCheckoutConfig,
  createPaymentIntent,
};
