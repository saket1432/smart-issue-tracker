describe('api helper transforms', () => {
  it('normalizes backend ticket status and priority values for the UI', () => {
    const { normalizeTicket } = require('./api');

    const ticket = normalizeTicket({
      _id: 'abc123',
      title: 'Login issue',
      description: 'Login button does nothing',
      category: 'bug',
      status: 'in_progress',
      priority: 'high',
      impact: 3,
      urgency: 2,
    });

    expect(ticket).toMatchObject({
      id: 'abc123',
      title: 'Login issue',
      status: 'In Progress',
      priority: 'High',
    });
  });

  it('counts only tickets reported by the selected database user', () => {
    const { countTicketsReportedBy } = require('./api');
    const tickets = [
      { requester: 'user-1', assignee: 'user-2' },
      { requester: { _id: 'user-1' }, assignee: 'user-3' },
      { requester: { id: 'user-2' }, assignee: 'user-1' },
    ];

    expect(countTicketsReportedBy(tickets, 'user-1')).toBe(2);
    expect(countTicketsReportedBy(tickets, null)).toBe(0);
  });

  it('includes all registration fields in the backend payload', async () => {
    const { registerUser } = require('./api');
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    await registerUser({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'secret123',
      role: 'admin',
      employeeId: 'EMP-101',
      department: 'Engineering',
      phone: '1234567890',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Alice Johnson',
          email: 'alice@example.com',
          password: 'secret123',
          role: 'user',
          employeeId: 'EMP-101',
          department: 'Engineering',
          phone: '1234567890',
        }),
      }),
    );

    global.fetch = originalFetch;
  });

  it('loads admin stats and notifications from the backend endpoints used by the dashboard', async () => {
    const { getAdminStats, getNotifications } = require('./api');
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ stats: { totalTickets: 5 }, notifications: [] }),
    });

    await getAdminStats();
    await getNotifications();

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/admin/stats'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/dashboard/notifications'),
      expect.objectContaining({ method: 'GET' })
    );

    global.fetch = originalFetch;
  });

  it('treats only admin-role sessions as admin access', () => {
    const { isAdminUser } = require('./api');

    expect(isAdminUser({ role: 'admin' })).toBe(true);
    expect(isAdminUser({ role: 'user' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it('sends admin ticket status changes to the protected backend endpoint', async () => {
    const { updateTicketStatus } = require('./api');
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        ticket: { _id: 'ticket-1', status: 'in_progress', title: 'Printer issue' },
      }),
    });

    await expect(updateTicketStatus('ticket-1', 'in_progress')).resolves.toMatchObject({
      id: 'ticket-1',
      status: 'In Progress',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tickets/ticket-1/status'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_progress' }),
      })
    );

    global.fetch = originalFetch;
  });

  it('loads and normalizes overdue tickets from the server', async () => {
    const { getOverdueTickets } = require('./api');
    const originalFetch = global.fetch;
    const slaDeadline = '2026-10-20T10:00:00.000Z';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        tickets: [{ _id: 'late-1', status: 'in_progress', slaDeadline }],
      }),
    });

    await expect(getOverdueTickets()).resolves.toMatchObject([
      { id: 'late-1', status: 'In Progress', slaDeadline },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tickets/overdue'),
      expect.objectContaining({ method: 'GET' })
    );

    global.fetch = originalFetch;
  });

  it('saves profile edits through the authenticated profile endpoint', async () => {
    const { updateCurrentUser } = require('./api');
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ user: { name: 'Alice Updated', role: 'user' } }),
    });

    await expect(updateCurrentUser({ name: 'Alice Updated' })).resolves.toMatchObject({
      name: 'Alice Updated',
      role: 'user',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Alice Updated' }),
      })
    );

    global.fetch = originalFetch;
  });
});
