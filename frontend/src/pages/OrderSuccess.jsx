import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/api';
import {
  CheckCircle,
  PackageCheck,
  CreditCard,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const { data } = await api.get(`/orders/${id}`);
          setOrder(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Could not retrieve order details');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Finalizing order confirmation receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Order record not found'}</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 pb-20">
      {/* Success Hero Badge */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle size={36} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Payment Authorized & Order Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Your payment was processed via Stripe Sandbox and your purchased items were deducted from live MongoDB stock.
        </p>
      </div>

      {/* Transaction & Receipt Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-5">
          <div>
            <span className="text-[11px] text-slate-400 font-mono block">ORDER CONFIRMATION</span>
            <span className="text-lg font-bold text-white font-mono">#{order._id}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Payment Status: {order.paymentStatus}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Fulfillment: {order.fulfillmentStatus}
            </span>
          </div>
        </div>

        {/* Payment & Security Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <CreditCard size={14} className="text-sky-400" />
              Stripe Transaction ID
            </span>
            <p className="font-mono text-slate-200 truncate">{order.paymentResult?.id || 'sim_stripe_sandbox'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar size={14} className="text-indigo-400" />
              Order Timestamp
            </span>
            <p className="text-slate-200">
              {new Date(order.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              Stock Adjustment
            </span>
            <p className="text-emerald-400 font-semibold">Inventory Subtracted</p>
          </div>
        </div>

        {/* Itemized Purchased Products */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Purchased Hardware & Quantities
          </h3>

          <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-950 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Quantity Reserved: {item.qty} × ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white font-mono">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Financial Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-700/60">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-400" />
              Shipping Destination
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed space-y-0.5">
              <p className="font-semibold text-white">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-right sm:text-right">
            <div className="flex justify-between text-slate-400">
              <span>Items Total:</span>
              <span className="font-mono text-slate-200">${Number(order.itemsPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sales Tax:</span>
              <span className="font-mono text-slate-200">${Number(order.taxPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping:</span>
              <span className="font-mono text-slate-200">
                {order.shippingPrice === 0 ? 'FREE' : `$${Number(order.shippingPrice).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Paid Total:</span>
              <span className="font-mono text-sky-400 text-base">
                ${Number(order.totalPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
        >
          <PackageCheck size={16} />
          View All Past Orders
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
