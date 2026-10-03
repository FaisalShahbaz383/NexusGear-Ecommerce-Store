import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  Package,
  Calendar,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect Admins away from personal orders to Admin Master Orders Fulfillment
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/orders');
    }
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not retrieve your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading your purchase records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Package className="text-sky-400" size={26} />
          Your Purchase History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review all confirmed orders and fulfillment tracking updates.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-slate-800/30 border border-slate-800 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">No previous orders found</h3>
          <p className="text-xs text-slate-400">
            You haven't completed any purchases yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/25"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl bg-slate-800/50 border border-slate-700/60 overflow-hidden shadow-xl space-y-4"
            >
              {/* Order Header Card */}
              <div className="p-5 sm:p-6 bg-slate-800/90 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                      Order ID
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      #{order._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={13} className="text-slate-500" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.fulfillmentStatus === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : order.fulfillmentStatus === 'Shipped'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    Fulfillment: {order.fulfillmentStatus}
                  </span>

                  <Link
                    to={`/order-success/${order._id}`}
                    state={{ order }}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                    title="View Receipt"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="px-5 sm:px-6 pb-2 space-y-3">
                <div className="divide-y divide-slate-800">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Quantity: {item.qty} × ${Number(item.price).toFixed(2)}
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

              {/* Order Footer & Total */}
              <div className="px-5 sm:px-6 py-4 bg-slate-900/60 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="text-slate-400">
                  <span>Shipping Destination: </span>
                  <span className="text-slate-200">
                    {order.shippingAddress?.city}, {order.shippingAddress?.country}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-medium">Grand Total Paid:</span>
                  <span className="text-base font-extrabold text-sky-400 font-mono">
                    ${Number(order.totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;