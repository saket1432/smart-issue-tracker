const TicketHistory = require('../models/TicketHistory');
const Notification = require('../models/Notification');

const recordTicketHistory = async ({
  ticket,
  changedBy,
  field,
  oldValue,
  newValue,
  note = '',
}) => {
  if (!ticket || !changedBy || !field) return null;

  return TicketHistory.create({
    ticket: ticket._id || ticket,
    changedBy,
    field,
    oldValue,
    newValue,
    note,
  });
};

const createTicketNotification = async ({
  userId,
  ticketId,
  type,
  message,
}) => {
  if (!userId || !message) return null;

  return Notification.create({
    user: userId,
    ticket: ticketId || null,
    type: type || 'system',
    message,
  });
};

module.exports = {
  recordTicketHistory,
  createTicketNotification,
};
