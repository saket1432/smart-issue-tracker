/**
 * @openapi
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     description: Requires a signed-in user or admin. First run POST /api/auth/login, click Authorize, and paste the returned token without the Bearer prefix. Detects similar tickets in the same category, links duplicates to the original, and reuses an existing resolution when one is available.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Login page not responding
 *               description:
 *                 type: string
 *                 example: Clicking login button does nothing for some users
 *               category:
 *                 type: string
 *                 example: bug
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               impact:
 *                 type: number
 *                 example: 3
 *               urgency:
 *                 type: number
 *                 example: 2
 *               assignee:
 *                 type: string
 *                 nullable: true
 *                 example: 64d2c7f754d9d6a8ec2bc9df
 *     responses:
 *       201:
 *         description: Ticket created
 *       400:
 *         description: Title, description, or category is missing
 *       401:
 *         description: Missing, invalid, or expired bearer token
 *   get:
 *     summary: Get tickets for the current user or all tickets for admin
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket details
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details returned
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     description: Requires the admin role.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, pending, closed]
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Ticket status updated
 * /api/tickets/{id}/priority:
 *   patch:
 *     summary: Update ticket priority score inputs
 *     description: Requires the admin role.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminPriority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: urgent
 *               impact:
 *                 type: number
 *                 example: 4
 *               urgency:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Ticket priority updated
 * /api/tickets/{id}/resolve:
 *   patch:
 *     summary: Resolve a ticket
 *     description: Requires the admin role.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolutionNotes:
 *                 type: string
 *                 example: Root cause fixed and verified in production.
 *     responses:
 *       200:
 *         description: Ticket resolved and the same resolution applied to linked duplicate tickets
 * /api/tickets/{id}/assign:
 *   patch:
 *     summary: Assign a ticket to an employee
 *     description: Requires the admin role.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignee
 *             properties:
 *               assignee:
 *                 type: string
 *                 example: 64d2c7f754d9d6a8ec2bc9df
 *     responses:
 *       200:
 *         description: Ticket assigned
 * /api/tickets/{id}/comments:
 *   post:
 *     summary: Add a comment to a ticket
 *     description: Requesters and admins can comment. A requester follow-up reopens a resolved or closed ticket.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: I checked the server logs and found the issue.
 *     responses:
 *       201:
 *         description: Comment added
 * /api/tickets/{id}/history:
 *   get:
 *     summary: Get ticket history
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: History returned
 * /api/tickets/overdue:
 *   get:
 *     summary: Get overdue tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue tickets returned
 */
const express = require('express');
const Ticket = require('../models/Ticket');
const SlaPolicy = require('../models/SlaPolicy');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const TicketHistory = require('../models/TicketHistory');
const { protect, adminOnly } = require('../middleware/auth');
const { calculatePriorityScore, getSlaDeadline, findDuplicateTickets } = require('../utils/smartFeatures');
const { recordTicketHistory, createTicketNotification } = require('../utils/ticketActivity');

const router = express.Router();

router.use(protect);

router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, impact, urgency, assignee } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }

    const normalizedPriority = priority || 'medium';
    const finalImpact = Number(impact) || 1;
    const finalUrgency = Number(urgency) || 1;
    const ageHours = 0;
    const now = new Date();
    const defaultSlaPolicy = await SlaPolicy.findOne({ isDefault: true }).sort({ createdAt: -1 });
    const newTicket = {
      title,
      description,
      category,
      priority: normalizedPriority,
      adminPriority: normalizedPriority,
      impact: finalImpact,
      urgency: finalUrgency,
      requester: req.user._id,
      assignee: assignee || null,
      slaDeadline: defaultSlaPolicy
        ? new Date(now.getTime() + Number(defaultSlaPolicy.resolutionHours) * 60 * 60 * 1000)
        : getSlaDeadline(now, finalUrgency),
      responseDeadline: defaultSlaPolicy
        ? new Date(now.getTime() + Number(defaultSlaPolicy.responseHours) * 60 * 60 * 1000)
        : null,
      priorityScore: calculatePriorityScore({ adminPriority: normalizedPriority, impact: finalImpact, urgency: finalUrgency, ageHours }),
    };

    const ticket = await Ticket.create(newTicket);

    await recordTicketHistory({
      ticket,
      changedBy: req.user._id,
      field: 'created',
      oldValue: null,
      newValue: { title: ticket.title, category: ticket.category, status: ticket.status },
      note: 'Ticket created',
    });

    const duplicateMatches = await findDuplicateTickets(Ticket, title, category, ticket._id);
    if (duplicateMatches.length > 0) {
      ticket.duplicateOf = duplicateMatches[0].duplicateOf || duplicateMatches[0]._id;
      const originalTicket = await Ticket.findById(ticket.duplicateOf);
      if (originalTicket?.status === 'resolved' && originalTicket.resolutionNotes) {
        ticket.status = 'resolved';
        ticket.resolutionNotes = originalTicket.resolutionNotes;
      }
      await ticket.save();
      if (ticket.status === 'resolved') {
        await recordTicketHistory({
          ticket,
          changedBy: req.user._id,
          field: 'resolution',
          oldValue: 'open',
          newValue: 'resolved',
          note: `Resolved from similar ticket ${originalTicket._id}: ${ticket.resolutionNotes}`,
        });
      }
    }

    await Notification.create({
      user: req.user._id,
      ticket: ticket._id,
      type: 'system',
      message: ticket.status === 'resolved'
        ? `Similar ticket "${ticket.title}" was created with the existing resolution: ${ticket.resolutionNotes}`
        : `Ticket "${ticket.title}" was created successfully.`,
    });

    return res.status(201).json({ ticket, duplicateMatches });
  } catch (error) {
    return res.status(500).json({ message: 'Ticket creation failed', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { requester: req.user._id };

    const tickets = await Ticket.find(filter)
      .populate('requester', 'name email role')
      .populate('assignee', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

router.get('/overdue', async (req, res) => {
  try {
    const overdueFilter = {
      slaDeadline: { $lt: new Date() },
      status: { $nin: ['resolved', 'closed'] },
    };
    const filter = req.user.role === 'admin'
      ? overdueFilter
      : { ...overdueFilter, requester: req.user._id };

    const tickets = await Ticket.find(filter).populate('requester', 'name email').populate('assignee', 'name email');
    return res.json({ tickets, count: tickets.length });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch overdue tickets', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('requester', 'name email role')
      .populate('assignee', 'name email role')
      .populate('duplicateOf', 'title status resolutionNotes');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const requesterId = ticket.requester?._id ?? ticket.requester;

    if (req.user.role !== 'admin' && String(requesterId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await Comment.find({ ticket: ticket._id }).populate('author', 'name email');
    const history = await TicketHistory.find({ ticket: ticket._id }).populate('changedBy', 'name email').sort({ createdAt: -1 });

    return res.json({ ticket, comments, history });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
});

router.patch('/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (status === 'resolved') {
      return res.status(400).json({ message: 'Use the resolve endpoint to apply the resolution to linked duplicates.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status || ticket.status;
    ticket.lastUpdatedAt = new Date();
    await ticket.save();

    await recordTicketHistory({
      ticket,
      changedBy: req.user._id,
      field: 'status',
      oldValue: oldStatus,
      newValue: ticket.status,
      note: 'Status updated by admin',
    });

    if (ticket.requester) {
      await createTicketNotification({
        userId: ticket.requester,
        ticketId: ticket._id,
        type: 'status_change',
        message: `Ticket status changed from ${oldStatus} to ${ticket.status}.`,
      });
    }

    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update ticket status', error: error.message });
  }
});

router.patch('/:id/priority', adminOnly, async (req, res) => {
  try {
    const { adminPriority, impact, urgency } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const previousAdminPriority = ticket.adminPriority;
    const previousImpact = ticket.impact;
    const previousUrgency = ticket.urgency;

    if (adminPriority) ticket.adminPriority = adminPriority;
    if (impact) ticket.impact = Number(impact);
    if (urgency) ticket.urgency = Number(urgency);

    ticket.priorityScore = calculatePriorityScore({
      adminPriority: ticket.adminPriority,
      impact: ticket.impact,
      urgency: ticket.urgency,
      ageHours: 0,
    });

    await ticket.save();

    await recordTicketHistory({
      ticket,
      changedBy: req.user._id,
      field: 'priority',
      oldValue: {
        adminPriority: previousAdminPriority,
        impact: previousImpact,
        urgency: previousUrgency,
      },
      newValue: {
        adminPriority: ticket.adminPriority,
        impact: ticket.impact,
        urgency: ticket.urgency,
      },
      note: 'Priority updated by admin',
    });

    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update ticket priority', error: error.message });
  }
});

router.patch('/:id/resolve', adminOnly, async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const resolvedAt = new Date();
    const finalResolutionNotes = resolutionNotes || ticket.resolutionNotes || 'Ticket resolved';
    let rootTicket = ticket;
    const ancestorIds = new Set([String(ticket._id)]);
    while (rootTicket.duplicateOf && !ancestorIds.has(String(rootTicket.duplicateOf))) {
      ancestorIds.add(String(rootTicket.duplicateOf));
      const parentTicket = await Ticket.findById(rootTicket.duplicateOf);
      if (!parentTicket) break;
      rootTicket = parentTicket;
    }
    const rootId = rootTicket._id;
    const group = [rootTicket, ticket].filter((member, index, items) =>
      items.findIndex((candidate) => String(candidate._id) === String(member._id)) === index
    );
    const seen = new Set(group.map((member) => String(member._id)));
    let frontier = [...seen];

    while (frontier.length > 0) {
      const children = await Ticket.find({ duplicateOf: { $in: frontier } });
      frontier = children.map((child) => String(child._id)).filter((id) => !seen.has(id));
      frontier.forEach((id) => seen.add(id));
      group.push(...children.filter((child) => !group.some((member) => String(member._id) === String(child._id))));
    }

    for (const member of group) {
      if (member.status === 'closed') continue;
      const oldStatus = member.status;
      const oldNotes = member.resolutionNotes || '';
      member.status = 'resolved';
      member.resolutionNotes = finalResolutionNotes;
      member.lastUpdatedAt = resolvedAt;
      await member.save();

      if (oldStatus !== 'resolved' || oldNotes !== finalResolutionNotes) {
        await recordTicketHistory({
          ticket: member,
          changedBy: req.user._id,
          field: 'resolution',
          oldValue: oldStatus,
          newValue: 'resolved',
          note: String(member._id) === String(ticket._id)
            ? finalResolutionNotes
            : `Resolved from duplicate ticket ${ticket._id}: ${finalResolutionNotes}`,
        });
        await createTicketNotification({
          userId: member.requester,
          ticketId: member._id,
          type: 'status_change',
          message: String(member._id) === String(ticket._id)
            ? `Ticket "${member.title}" has been resolved.`
            : `Similar ticket "${member.title}" was resolved with the response from ticket ${ticket._id}.`,
        });
      }
    }

    const resolvedTicket = group.find((member) => String(member._id) === String(ticket._id));
    return res.json({ ticket: resolvedTicket, resolvedDuplicateCount: Math.max(group.length - 1, 0) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to resolve ticket', error: error.message });
  }
});

router.patch('/:id/assign', adminOnly, async (req, res) => {
  try {
    const { assignee } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldAssignee = ticket.assignee;
    ticket.assignee = assignee || ticket.assignee;
    await ticket.save();

    await recordTicketHistory({
      ticket,
      changedBy: req.user._id,
      field: 'assignee',
      oldValue: oldAssignee,
      newValue: ticket.assignee,
      note: 'Ticket reassigned',
    });

    if (ticket.assignee && ticket.assignee.toString() !== oldAssignee?.toString()) {
      await createTicketNotification({
        userId: ticket.assignee,
        ticketId: ticket._id,
        type: 'assignment',
        message: `You have been assigned to ticket "${ticket.title}".`,
      });
    }

    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to assign ticket', error: error.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const requesterId = ticket.requester?._id ?? ticket.requester;
    const isRequester = String(requesterId) === String(req.user._id);

    if (req.user.role !== 'admin' && !isRequester) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      message,
    });

    let reopened = false;
    if (isRequester && ['resolved', 'closed'].includes(ticket.status)) {
      const oldStatus = ticket.status;
      ticket.status = 'open';
      ticket.lastUpdatedAt = new Date();
      await ticket.save();
      reopened = true;

      await recordTicketHistory({
        ticket,
        changedBy: req.user._id,
        field: 'status',
        oldValue: oldStatus,
        newValue: 'open',
        note: 'Ticket reopened after requester follow-up',
      });
    }

    await recordTicketHistory({
      ticket,
      changedBy: req.user._id,
      field: 'comment',
      oldValue: null,
      newValue: message,
      note: 'Comment added',
    });

    const recipients = isRequester
      ? [...await User.distinct('_id', { role: 'admin' }), ...(ticket.assignee ? [ticket.assignee] : [])]
      : [requesterId];
    const uniqueRecipients = [...new Map(
      recipients.filter(Boolean).map((userId) => [String(userId), userId])
    ).values()].filter((userId) => String(userId) !== String(req.user._id));

    await Promise.all(uniqueRecipients.map((userId) => createTicketNotification({
      userId,
      ticketId: ticket._id,
      type: 'comment',
      message: reopened
        ? req.user.name + ' commented on and reopened ticket "' + ticket.title + '".'
        : req.user.name + ' commented on ticket "' + ticket.title + '".',
    })));

    return res.status(201).json({ comment, ticket });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const requesterId = ticket.requester?._id ?? ticket.requester;

    if (req.user.role !== 'admin' && String(requesterId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const history = await TicketHistory.find({ ticket: ticket._id }).populate('changedBy', 'name email').sort({ createdAt: -1 });
    return res.json({ history });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch ticket history', error: error.message });
  }
});

module.exports = router;
