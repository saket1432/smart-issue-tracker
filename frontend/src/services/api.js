import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LAN_IP = '192.168.0.190';

export const API_BASE_URL = Platform.OS === 'android'
  ? `http://${LAN_IP}:5000/api`
  : 'http://localhost:5000/api';

const API_TIMEOUT_MS = 15000;

const STATUS_MAP = {
  open: 'Open',
  in_progress: 'In Progress',
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

const PRIORITY_MAP = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const COLOR_MAP = {
  Open: '#64748B',
  'In Progress': '#2563EB',
  Pending: '#D97706',
  Resolved: '#059669',
  Closed: '#475569',
};

export const saveSession = async (token, user) => {
  await AsyncStorage.setItem(
    '@smart_issue_tracker:session',
    JSON.stringify({ token, user })
  );
};

export const getSession = async () => {
  const raw = await AsyncStorage.getItem('@smart_issue_tracker:session');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export const clearSession = async () => {
  await AsyncStorage.removeItem('@smart_issue_tracker:session');
};

export const normalizeTicket = (ticket = {}) => {
  const status = STATUS_MAP[ticket.status] || ticket.status || 'Open';
  const priority = PRIORITY_MAP[ticket.adminPriority] || PRIORITY_MAP[ticket.priority]
    || ticket.adminPriority || ticket.priority || 'Medium';

  return {
    id: ticket._id || ticket.id || 'TKT-UNKNOWN',
    _id: ticket._id || ticket.id || null,
    title: ticket.title || 'Untitled ticket',
    description: ticket.description || '',
    category: ticket.category || 'Uncategorized',
    status,
    priority,
    impact: ticket.impact ?? 1,
    urgency: ticket.urgency ?? 1,
    requester: ticket.requester || null,
    assignee: ticket.assignee || null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    slaDeadline: ticket.slaDeadline,
    responseDeadline: ticket.responseDeadline,
    resolutionNotes: ticket.resolutionNotes || '',
    duplicateOf: ticket.duplicateOf || null,
    color: COLOR_MAP[status] || '#64748B',
  };
};

export const countTicketsReportedBy = (tickets = [], userId) => {
  if (!userId) return 0;

  return tickets.filter((ticket) => {
    const requesterId = ticket.requester && typeof ticket.requester === 'object'
      ? ticket.requester._id || ticket.requester.id
      : ticket.requester;
    return String(requesterId || '') === String(userId);
  }).length;
};

export const apiRequest = async (endpoint, options = {}) => {
  const session = await getSession();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
      signal: controller.signal,
    });

    const text = await response.text();
    let payload = {};

    try {
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(payload.message || 'Request failed');
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Check the backend server and network connection.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const registerUser = async ({ name, email, password, employeeId, department, phone }) => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      password,
      role: 'user',
      employeeId,
      department,
      phone,
    },
  });

  return response;
};

export const loginUser = async ({ email, password }) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  return response;
};

export const fetchTickets = async () => {
  const response = await apiRequest('/tickets');
  const tickets = Array.isArray(response.tickets) ? response.tickets : [];
  return tickets.map(normalizeTicket);
};

export const getTicketDetails = async (ticketId) => {
  const response = await apiRequest(`/tickets/${ticketId}`);
  return {
    ticket: normalizeTicket(response.ticket),
    comments: Array.isArray(response.comments) ? response.comments : [],
    history: Array.isArray(response.history) ? response.history : [],
  };
};

export const getTicketHistory = async (ticketId) => {
  const response = await apiRequest(`/tickets/${ticketId}/history`);
  return Array.isArray(response.history) ? response.history : [];
};

export const addTicketComment = async (ticketId, message) => {
  const response = await apiRequest(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: { message },
  });

  return {
    comment: response.comment || null,
    ticket: response.ticket ? normalizeTicket(response.ticket) : null,
  };
};

export const createTicket = async ({
  title,
  description,
  category,
  priority,
  impact,
  urgency,
  assignee = null,
}) => {
  const response = await apiRequest('/tickets', {
    method: 'POST',
    body: {
      title,
      description,
      category,
      priority,
      impact: Number(impact),
      urgency: Number(urgency),
      assignee,
    },
  });

  return {
    ticket: normalizeTicket(response.ticket),
    duplicateMatches: Array.isArray(response.duplicateMatches)
      ? response.duplicateMatches.map(normalizeTicket)
      : [],
  };
};

export const isAdminUser = (user = null) => user?.role === 'admin';

export const getCurrentUser = async () => {
  const response = await apiRequest('/auth/me');
  return response.user || null;
};

export const updateCurrentUser = async (profile) => {
  const response = await apiRequest('/auth/me', {
    method: 'PATCH',
    body: profile,
  });
  return response.user || null;
};

export const getNotifications = async () => {
  const response = await apiRequest('/dashboard/notifications');
  return Array.isArray(response.notifications) ? response.notifications : [];
};

export const getAdminUsers = async () => {
  const response = await apiRequest('/admin/users');
  return Array.isArray(response.users) ? response.users : [];
};

export const getAdminStats = async () => {
  const response = await apiRequest('/admin/stats');
  return response.stats || response;
};

export const getOverdueTickets = async () => {
  const response = await apiRequest('/tickets/overdue');
  const tickets = Array.isArray(response.tickets) ? response.tickets : [];
  return tickets.map(normalizeTicket);
};

export const updateTicketStatus = async (ticketId, status) => {
  const response = await apiRequest(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: { status },
  });

  return normalizeTicket(response.ticket);
};

export const updateTicketPriority = async (ticketId, { adminPriority, impact, urgency }) => {
  const response = await apiRequest(`/tickets/${ticketId}/priority`, {
    method: 'PATCH',
    body: { adminPriority, impact: Number(impact), urgency: Number(urgency) },
  });
  return normalizeTicket(response.ticket);
};

export const resolveTicket = async (ticketId, resolutionNotes) => {
  const response = await apiRequest(`/tickets/${ticketId}/resolve`, {
    method: 'PATCH',
    body: { resolutionNotes },
  });
  return normalizeTicket(response.ticket);
};

export const assignTicket = async (ticketId, assignee) => {
  const response = await apiRequest(`/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    body: { assignee },
  });
  return normalizeTicket(response.ticket);
};

export const updateAdminUser = async (userId, userDetails) => {
  const response = await apiRequest(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: userDetails,
  });
  return response.user || null;
};

export const updateAdminUserRole = async (userId, role) => {
  const response = await apiRequest(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { role },
  });
  return response.user || null;
};

export const getDashboardStats = async () => {
  const response = await apiRequest('/dashboard');
  return response.stats || response;
};

export const getApiHealth = async () => apiRequest('/health');

export const getServerStatus = async () => {
  const serverBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  const response = await fetch(`${serverBaseUrl}/`, { headers: { Accept: 'application/json' } });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(payload.message || 'API server is unavailable');
  return payload;
};

export const getSlaPolicies = async () => {
  const response = await apiRequest('/sla');
  return Array.isArray(response.policies) ? response.policies : [];
};

export const createSlaPolicy = async (policy) => {
  const response = await apiRequest('/sla', { method: 'POST', body: policy });
  return response.policy || null;
};

export const updateSlaPolicy = async (policyId, policy) => {
  const response = await apiRequest(`/sla/${policyId}`, { method: 'PATCH', body: policy });
  return response.policy || null;
};

export default {
  API_BASE_URL,
  saveSession,
  getSession,
  clearSession,
  normalizeTicket,
  countTicketsReportedBy,
  apiRequest,
  registerUser,
  loginUser,
  fetchTickets,
  getTicketDetails,
  getTicketHistory,
  addTicketComment,
  createTicket,
  isAdminUser,
  getCurrentUser,
  updateCurrentUser,
  getNotifications,
  getAdminUsers,
  getAdminStats,
  getOverdueTickets,
  updateTicketStatus,
  updateTicketPriority,
  resolveTicket,
  assignTicket,
  updateAdminUserRole,
  getDashboardStats,
  getApiHealth,
  getServerStatus,
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy,
};
