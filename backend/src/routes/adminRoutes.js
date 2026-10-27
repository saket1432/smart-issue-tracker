/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List application users
 *     description: Requires the admin role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users returned
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     description: Requires the admin role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: Requires the admin role.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats returned
 */
const express = require('express');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'employeeId', 'department', 'phone'];
    const submittedFields = Object.keys(req.body || {});
    if (submittedFields.length === 0 || submittedFields.some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({ message: 'Provide valid user profile fields to update' });
    }

    const updates = {};
    for (const field of ['name', 'employeeId', 'department', 'phone']) {
      if (req.body[field] === undefined) continue;
      if (typeof req.body[field] !== 'string') {
        return res.status(400).json({ message: `${field} must be text` });
      }
      updates[field] = req.body[field].trim();
    }

    if (Object.hasOwn(req.body, 'name') && !updates.name) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    if (Object.hasOwn(req.body, 'email')) {
      if (typeof req.body.email !== 'string') {
        return res.status(400).json({ message: 'Email must be text' });
      }
      updates.email = req.body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        return res.status(400).json({ message: 'Enter a valid email address' });
      }
      const duplicate = await User.findOne({ email: updates.email, _id: { $ne: req.params.id } });
      if (duplicate) return res.status(409).json({ message: 'Another account already uses this email' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Another account already uses this email' });
    }
    return res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (role !== 'user') {
      return res.status(400).json({ message: 'Only the existing primary admin can have the admin role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'The primary admin cannot remove their own admin access' });
    }

    user.role = 'user';
    await user.save();
    return res.json({ user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({ message: 'Admin stats failed', error: error.message });
  }
});

module.exports = router;
