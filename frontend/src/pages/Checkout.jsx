import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import {
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const {
    cartItems,
    itemsCount,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  // Redirect Admins away from Checkout to Admin Products Management
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/products');
    }
  }, [user, navigate]);

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    postalCode: '97477',
    country: 'United States',
  });

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [serverPricing, setServerPricing] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  // Initialize Payment Intent on mount or when cart changes
  useEffect(() => {
    if (cartItems.length === 0) return;

    const preparePaymentIntent = async () => {
      try {
        setCheckoutError(null);
        const { data } = await api.post('/checkout/create-payment-intent', {
          items: cartItems.map((item) => ({
            product: item.product,
            qty: item.qty,
          })),
          shippingAddress,
        });

        setServerPricing(data.pricing);
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment intent preparation error:', err);
        setCheckoutError(
          err.response?.data?.message || 'Failed to prepare payment session.'
        );
      }
    };

    preparePaymentIntent();
  }, [cartItems]);

  const handleShippingChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      setCheckoutError('Please fill in all shipping address fields.');
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutError('Your shopping cart is empty.');
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const transactionId = clientSecret.startsWith('pi_')
        ? clientSecret.split('_secret_')[0]
        : `pi_test_${Date.now()}_sandbox`;

      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          title: item.title,
          qty: item.qty,
          imageUrl: item.imageUrl,
          price: item.price,
          product: item.product,
        })),
        shippingAddress,
        paymentMethod: 'Stripe Credit Card',
        itemsPrice: serverPricing ? serverPricing.itemsPrice : itemsPrice,
        taxPrice: serverPricing ? serverPricing.taxPrice : taxPrice,
        shippingPrice: serverPricing ? serverPricing.shippingPrice : shippingPrice,
        totalPrice: serverPricing ? serverPricing.totalPrice : totalPrice,
        isPaid: true,
        paymentResult: {
          id: transactionId,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: user.email,
        },
      };

      const { data: createdOrder } = await api.post('/orders', orderPayload);

      clearCart();
      navigate(`/order-success/${createdOrder._id}`, { state: { order: createdOrder } });
    } catch (err) {
      console.error('Order creation error:', err);
      setCheckoutError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-2xl font-bold text-white">Your cart is currently empty</h2>
        <p className="text-xs text-slate-400">
          Browse our collection and add gear to complete your order.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/25"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const finalItemsPrice = serverPricing ? serverPricing.itemsPrice : itemsPrice;
  const finalTaxPrice = serverPricing ? serverPricing.taxPrice : taxPrice;
  const finalShippingPrice = serverPricing ? serverPricing.shippingPrice : shippingPrice;
  const finalTotalPrice = serverPricing ? serverPricing.totalPrice : totalPrice;

  return (
    <div className="space-y-8 pb-20">
      {/* Checkout Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Lock className="text-sky-400" size={24} />
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Encrypted order processing and instant order confirmation
        </p>
      </div>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProcessPayment} className="space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Shipping Address
                </h2>
                <span className="text-xs text-slate-400">Recipient Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={shippingAddress.postalCode}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Details */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Payment Gateway
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px]">
                  <Sparkles size={12} />
                  <span>256-BIT ENCRYPTED</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <CreditCard size={15} className="text-sky-400" />
                    Credit / Debit Card
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">Secured via Stripe</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={cardNumber}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono tracking-wider focus:outline-none"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center space-x-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        VISA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={cardExpiry}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={cardCvc}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/50 flex items-start gap-2 text-[11px] text-sky-300">
                  <ShieldCheck size={16} className="text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Your transaction is protected with end-to-end SSL encryption. Submitting will confirm your payment and generate your order receipt.
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white transition-all shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment & Securing Order...</span>
                  </div>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Pay ${finalTotalPrice.toFixed(2)} & Complete Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Cart Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-sky-400" />
                Cart Summary ({itemsCount})
              </h2>
            </div>

            {/* Items List */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.product}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-lg bg-slate-950 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ${Number(item.price).toFixed(2)} each
                    </p>

                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product, item.qty - 1)}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-white">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product, item.qty + 1)}
                          disabled={item.qty >= item.countInStock}
                          className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-white font-mono">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-700/60 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-200">${finalItemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-mono text-slate-200">${finalTaxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-mono text-slate-200">
                  {finalShippingPrice === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `$${finalShippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="border-t border-slate-700/60 pt-2 flex justify-between text-sm font-extrabold text-white">
                <span>Order Total</span>
                <span className="font-mono text-sky-400 text-base">${finalTotalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Guaranteed Satisfaction
              </div>
              <p>All purchases include a 30-day money-back guarantee and official 1-year warranty.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;