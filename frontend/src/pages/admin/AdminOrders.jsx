import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
  ShoppingBag,
  Calendar,
  CheckCircle,
  Truck,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  ChevronDown,
} from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch master orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { fulfillmentStatus: newStatus });
      setSuccessMsg(`Order #${orderId.slice(-6)} fulfillment updated to "${newStatus}"`);
      // Update local state smoothly
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, fulfillmentStatus: newStatus } : o))
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order fulfillment');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'All' || order.fulfillmentStatus === statusFilter;
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shippingAddress?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 bg-slate-900/50 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShoppingBag className="text-sky-400" size={26} />
              Master Order Fulfillment
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track customer orders and update package logistics (Processing → Shipped → Delivered).
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <RefreshCw size={14} /> Refresh Stream
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by order ID, customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>

          {/* Status Tab Chips */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {['All', 'Processing', 'Shipped', 'Delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Master Orders Table */}
        <div className="rounded-3xl bg-slate-800/50 border border-slate-700/60 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 border-b border-slate-700 text-slate-300 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading orders from database...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-mono font-bold text-white">#{order._id.slice(-8)}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-200">
                            {order.user?.name || order.shippingAddress?.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {order.user?.email || 'Guest customer'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 font-medium">
                            {order.orderItems?.length || 0} items
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                            {order.orderItems?.map((i) => i.title).join(', ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ${Number(order.totalPrice).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        {/* Interactive Fulfillment Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={order.fulfillmentStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer transition-all ${
                              order.fulfillmentStatus === 'Delivered'
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                : order.fulfillmentStatus === 'Shipped'
                                ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                                : 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                            }`}
                          >
                            <option value="Processing" className="bg-slate-900 text-white">
                              Processing
                            </option>
                            <option value="Shipped" className="bg-slate-900 text-white">
                              Shipped
                            </option>
                            <option value="Delivered" className="bg-slate-900 text-white">
                              Delivered
                            </option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() =>
                              setExpandedOrder(expandedOrder === order._id ? null : order._id)
                            }
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Expand details"
                          >
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${
                                expandedOrder === order._id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Order Row with Items & Address */}
                      {expandedOrder === order._id && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={7} className="p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Shipping Information */}
                              <div className="space-y-2 text-xs">
                                <h4 className="font-bold text-white flex items-center gap-1.5">
                                  <MapPin size={14} className="text-sky-400" />
                                  Shipping Address
                                </h4>
                                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-0.5">
                                  <p className="font-semibold text-white">{order.shippingAddress?.fullName}</p>
                                  <p>{order.shippingAddress?.address}</p>
                                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                  <p>{order.shippingAddress?.country}</p>
                                </div>
                              </div>

                              {/* Stripe Transaction Proof */}
                              <div className="space-y-2 text-xs">
                                <h4 className="font-bold text-white flex items-center gap-1.5">
                                  <CheckCircle size={14} className="text-emerald-400" />
                                  Payment & Security Metadata
                                </h4>
                                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-1 font-mono text-[11px]">
                                  <p>Transaction ID: <span className="text-sky-400">{order.paymentResult?.id}</span></p>
                                  <p>Payment Method: {order.paymentMethod}</p>
                                  <p>Paid Timestamp: {order.paidAt ? new Date(order.paidAt).toLocaleString() : 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Itemized Products */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-xs text-white">Items in this Order</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {order.orderItems?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3"
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-10 h-10 rounded-lg object-cover bg-slate-950"
                                    />
                                    <div className="min-w-0 flex-1 text-xs">
                                      <p className="font-semibold text-white truncate">{item.title}</p>
                                      <p className="text-[11px] text-slate-400 font-mono">
                                        Qty: {item.qty} × ${Number(item.price).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
