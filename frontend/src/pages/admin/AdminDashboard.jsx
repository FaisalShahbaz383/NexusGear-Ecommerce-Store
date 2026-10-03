import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/metrics');
        setMetrics(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 bg-slate-900/50 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Analytics & Metrics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Overview of store revenue, active inventory, and order fulfillment status.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Aggregating database statistics...</p>
          </div>
        ) : (
          <>
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Revenue */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  ${metrics?.totalRevenue?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp size={12} />
                  <span>Gross Authorized Volume</span>
                </div>
              </div>

              {/* Card 2: Orders Count */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Orders</span>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {metrics?.totalOrders || 0}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Completed Checkout Orders</span>
                </div>
              </div>

              {/* Card 3: Registered Users */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Registered Users</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {metrics?.totalUsers || 0}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Active Customer Profiles</span>
                </div>
              </div>

              {/* Card 4: Low Stock Alerts */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Low Stock Alerts</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                  {metrics?.lowStockCount || 0}
                </div>
                <div className="text-[11px] text-amber-300/80 flex items-center gap-1 font-semibold">
                  <span>Items with ≤ 5 units remaining</span>
                </div>
              </div>
            </div>

            {/* Low Stock Warning Callout */}
            {metrics?.lowStockProducts && metrics.lowStockProducts.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle size={18} />
                    <span>Urgent: Low Stock Inventory Watchlist</span>
                  </div>
                  <Link
                    to="/admin/products"
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                  >
                    Manage Inventory <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {metrics.lowStockProducts.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 flex items-center space-x-3"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-950 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                        <p className="text-[11px] font-mono text-amber-400 font-bold mt-0.5">
                          Only {p.countInStock} Left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div className="rounded-3xl bg-slate-800/50 border border-slate-700/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package size={18} className="text-sky-400" />
                  Recent Storefront Transactions
                </h3>
                <Link
                  to="/admin/orders"
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  View All Orders <ArrowUpRight size={14} />
                </Link>
              </div>

              {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold text-[10px]">
                        <th className="pb-3 px-2">Order ID</th>
                        <th className="pb-3 px-2">Customer</th>
                        <th className="pb-3 px-2">Date</th>
                        <th className="pb-3 px-2">Total Amount</th>
                        <th className="pb-3 px-2">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {metrics.recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-2 font-mono text-white">#{order._id.slice(-8)}</td>
                          <td className="py-3 px-2 text-slate-300">
                            {order.user?.name || order.shippingAddress?.fullName}
                          </td>
                          <td className="py-3 px-2 text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 font-mono font-bold text-white">
                            ${Number(order.totalPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                order.fulfillmentStatus === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : order.fulfillmentStatus === 'Shipped'
                                  ? 'bg-sky-500/20 text-sky-400'
                                  : 'bg-indigo-500/20 text-indigo-400'
                              }`}
                            >
                              {order.fulfillmentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No orders recorded yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;