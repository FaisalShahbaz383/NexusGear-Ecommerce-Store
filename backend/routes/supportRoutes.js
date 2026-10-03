const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
} = require('../controllers/supportController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .post(optionalAuth, createTicket)
  .get(protect, admin, getAllTickets);

router.get('/my', protect, getMyTickets);
router.put('/:id', protect, admin, updateTicket);

module.exports = router;
