jest.mock('../services/api', () => ({
  clearSession: jest.fn(),
  fetchTickets: jest.fn(),
  getCurrentUser: jest.fn(),
  getDashboardStats: jest.fn(),
  isAdminUser: (user) => user?.role === 'admin',
}));

const React = require('react');
const renderer = require('react-test-renderer');
const { fetchTickets, getCurrentUser, getDashboardStats } = require('../services/api');
const UserDashboardScreen = require('./UserDashboardScreen').default;

describe('UserDashboardScreen', () => {
  beforeEach(() => {
    fetchTickets.mockResolvedValue([]);
    getCurrentUser.mockResolvedValue({ role: 'user' });
    getDashboardStats.mockResolvedValue({ totalTickets: 0 });
    jest.clearAllMocks();
  });

  it('reloads tickets whenever the screen receives focus', async () => {
    const focusHandlers = [];
    const navigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      addListener: jest.fn((event, handler) => {
        if (event === 'focus') {
          focusHandlers.push(handler);
        }
        return jest.fn();
      }),
    };

    await renderer.act(async () => {
      renderer.create(React.createElement(UserDashboardScreen, { navigation }));
    });

    expect(fetchTickets).toHaveBeenCalledTimes(1);

    await renderer.act(async () => {
      await focusHandlers[0]?.();
    });

    expect(fetchTickets).toHaveBeenCalledTimes(2);
  });

  it('redirects an admin to the admin dashboard', async () => {
    getCurrentUser.mockResolvedValue({ role: 'admin' });
    const navigation = {
      navigate: jest.fn(),
      replace: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    };

    await renderer.act(async () => {
      renderer.create(React.createElement(UserDashboardScreen, { navigation }));
    });

    expect(navigation.replace).toHaveBeenCalledWith('AdminDashboard');
    expect(fetchTickets).not.toHaveBeenCalled();
  });
});
