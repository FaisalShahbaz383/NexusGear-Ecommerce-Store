const SupportTicket = require('../models/SupportTicket');

// @desc    Submit a new customer support ticket
// @route   POST /api/support
// @access  Public (or Private with optional user attachment)
const createTicket = async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required ticket details' });
    }

    const ticket = new SupportTicket({
      user: req.user ? req.user._id : undefined,
      name,
      email,
      subject,
      category: category || 'General Inquiry',
      message,
      status: 'Open',
    });

    const savedTicket = await ticket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get support tickets for logged-in user
// @route   GET /api/support/my
// @access  Private
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all support tickets (Admin only)
// @route   GET /api/support
// @access  Private/Admin
const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update support ticket status and reply (Admin only)
// @route   PUT /api/support/:id
// @access  Private/Admin
const updateTicket = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) {
      ticket.status = status;
    }
    if (adminResponse !== undefined) {
      ticket.adminResponse = adminResponse;
      ticket.respondedAt = Date.now();
    }

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
};
