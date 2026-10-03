import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  Headphones,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Clock,
  ChevronDown,
} from 'lucide-react';

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect Admin users to the Admin Support Desk
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/support');
    }
  }, [user, navigate]);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  // Past user inquiries
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const fetchMyTickets = async () => {
    if (!user) return;
    try {
      setLoadingTickets(true);
      const { data } = await api.get('/support/my');
      setMyTickets(data);
    } catch (err) {
      console.warn('Could not fetch user tickets', err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      const { data } = await api.post('/support', {
        name,
        email,
        subject,
        category,
        message,
      });

      setFeedback({
        ticketId: data._id,
        message: 'Your inquiry has been successfully dispatched to our customer support engineering desk.',
      });
      setSubject('');
      setMessage('');
      fetchMyTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'What payment methods are accepted?',
      a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, and Discover) processed via our secure, encrypted Stripe checkout gateway.',
    },
    {
      q: 'How do I track my shipping?',
      a: 'Once your order is confirmed, you can track real-time fulfillment progression (Processing → Shipped → Delivered) directly within your Order History page.',
    },
    {
      q: 'What is your return and warranty policy?',
      a: 'Every NexusGear product comes with a 30-day money-back satisfaction guarantee and a comprehensive 1-year manufacturer warranty against hardware defects.',
    },
    {
      q: 'How long does delivery usually take?',
      a: 'Standard delivery arrives within 2-4 business days. Orders exceeding $100 automatically qualify for free expedited shipping.',
    },
    {
      q: 'How do I get assistance with an existing order?',
      a: 'Simply select "Order Issue" in the inquiry form, enter your details, and our dedicated customer support team will update your ticket with direct answers.',
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/10">
          <Headphones size={24} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Customer Support & Help Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Have questions about your order, delivery status, or gear specs? Our support specialists are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Support Inquiry Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-sky-400" />
              Submit an Inquiry
            </h2>

            {feedback && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle size={16} />
                  <span>Ticket Logged Successfully (#{feedback.ticketId.slice(-6)})</span>
                </div>
                <p className="text-slate-300">{feedback.message}</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Payment & Checkout">Payment & Checkout</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question regarding shipment tracking"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details about your inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50"
              >
                {submitting ? 'Transmitting Ticket...' : <><Send size={15} /> Send Support Request</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: FAQs & User Ticket History */}
        <div className="lg:col-span-5 space-y-6">
          {/* User's Previous Inquiries */}
          {user && (
            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-sky-400" />
                Your Support History ({myTickets.length})
              </h3>

              {loadingTickets ? (
                <div className="py-6 flex justify-center">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myTickets.length === 0 ? (
                <p className="text-xs text-slate-400">You haven't opened any support tickets yet.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[160px]">
                          {ticket.subject}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ticket.status === 'In Progress'
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px] line-clamp-2">{ticket.message}</p>

                      {ticket.adminResponse && (
                        <div className="mt-2 p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200">
                          <strong className="block text-sky-400 text-[10px] uppercase font-bold mb-0.5">
                            Support Team Response:
                          </strong>
                          {ticket.adminResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-400" />
              Frequently Asked Questions
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-700/60 bg-slate-900/50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-3.5 text-left text-xs font-semibold text-slate-200 flex items-center justify-between hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;