const Stripe = require('stripe');

let stripe = null;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (stripeKey && stripeKey.startsWith('sk_test_') && !stripeKey.includes('Mock')) {
  try {
    stripe = new Stripe(stripeKey);
    console.log('[Stripe Engine]: Live Test Secret Key Initialized');
  } catch (err) {
    console.warn('[Stripe Engine]: Stripe init warning:', err.message);
  }
} else if (stripeKey) {
  // Demo / Sandbox mock fallback instance
  try {
    stripe = new Stripe(stripeKey);
    console.log('[Stripe Engine]: Sandbox Mode Configured');
  } catch (e) {
    console.log('[Stripe Engine]: Operating in Sandbox Fallback');
  }
}

module.exports = stripe;
