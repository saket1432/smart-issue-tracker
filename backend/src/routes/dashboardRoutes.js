/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics for current user or admin
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned
 * /api/dashboard/notifications:
 *   get:
 *     summary: Get recent notifications for the current user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications returned
 */
const express = require('express');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const totalTickets = await Ticket.countDocuments();
      const openTickets = await Ticket.countDocuments({ status: 'open' });
      const pendingTickets = await Ticket.countDocuments({ status: 'pending' });
      const inProgress = await Ticket.countDocuments({ status: 'in_progress' });
      const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
      const closedTickets = await Ticket.countDocuments({ status: 'closed' });
      const overdueTickets = await Ticket.countDocuments({
        slaDeadline: { $lt: new Date() },
        status: { $nin: ['resolved', 'closed'] },
      });

      return res.json({
        stats: {
          totalTickets,
          openTickets,
          pendingTickets,
          inProgress,
          resolvedTickets,
          closedTickets,
          overdueTickets,
        },
      });
    }

    const userTickets = await Ticket.countDocuments({ requester: req.user._id });
    const userOpenTickets = await Ticket.countDocuments({ requester: req.user._id, status: 'open' });
    const userPendingTickets = await Ticket.countDocuments({ requester: req.user._id, status: 'pending' });
    const userResolvedTickets = await Ticket.countDocuments({ requester: req.user._id, status: 'resolved' });
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);

    return res.json({
      stats: {
        totalTickets: userTickets,
        openTickets: userOpenTickets,
        pendingTickets: userPendingTickets,
        resolvedTickets: userResolvedTickets,
      },
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Dashboard failed', error: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

module.exports = router;
