const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide inquiry subject'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Order Issue', 'Payment & Checkout', 'Product Question', 'Returns & Refunds', 'General Inquiry'],
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Please provide inquiry details'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    adminResponse: {
      type: String,
      default: '',
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;
