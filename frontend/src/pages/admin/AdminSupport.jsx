import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Send,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Active ticket selection
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusVal, setStatusVal] = useState('Open');
  const [replyText, setReplyText] = useState('');
  const [updating, setUpdating] = useState(false);

  // Status Filter
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/support');
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
        setStatusVal(data[0].status);
        setReplyText(data[0].adminResponse || '');
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    setStatusVal(t.status);
    setReplyText(t.adminResponse || '');
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdating(true);
      const { data } = await api.put(`/support/${selectedTicket._id}`, {
        status: statusVal,
        adminResponse: replyText,
      });

      setSuccessMsg(`Ticket #${selectedTicket._id.slice(-6)} updated to "${statusVal}"`);
      setSelectedTicket(data);
      setTickets((prev) =>
        prev.map((t) => (t._id === data._id ? data : t))
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 bg-slate-900/50 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="text-sky-400" size={26} />
              Customer Support Desk & Inbox
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review customer inquiries, investigate reported checkout anomalies, and transmit official replies.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <RefreshCw size={14} /> Refresh Inbox
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

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by subject, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>

          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === st
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Inbox View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Tickets Master List */}
          <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Loading support communications...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-800 text-center text-xs text-slate-400">
                No tickets matching your filter.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedTicket?._id === t._id
                      ? 'bg-slate-800 border-sky-500/60 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{t._id.slice(-6)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'In Progress'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{t.message}</p>

                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{t.name}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Ticket Inspection & Admin Action Panel */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                  <div>
                    <span className="text-xs text-sky-400 font-semibold">{selectedTicket.category}</span>
                    <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {selectedTicket.subject}
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Logged: {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Customer Info Card */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User size={15} className="text-sky-400" />
                    <span>Customer: <strong>{selectedTicket.name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Mail size={15} className="text-indigo-400" />
                    <span>Email: <a href={`mailto:${selectedTicket.email}`} className="text-sky-400 hover:underline">{selectedTicket.email}</a></span>
                  </div>
                </div>

                {/* Customer Inquiry Body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Inquiry Details
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* Response / Resolution Form */}
                <form onSubmit={handleUpdateTicket} className="space-y-4 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-bold text-white">
                      Fulfillment & Ticket Status:
                    </label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                        statusVal === 'Resolved'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : statusVal === 'In Progress'
                          ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                          : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                      }`}
                    >
                      <option value="Open" className="bg-slate-900 text-white">Open</option>
                      <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
                      <option value="Resolved" className="bg-slate-900 text-white">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Administrator Response / Resolution Note:
                    </label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write guidance, tracking verification, or resolution steps..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-500/25 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : <><Send size={14} /> Update Ticket & Dispatch Reply</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-slate-800/20 border border-slate-800 text-center text-xs text-slate-400">
                Select a ticket from the left panel to inspect details and formulate replies.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSupport;
