
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { clearSession, fetchTickets, getCurrentUser, getOverdueTickets, isAdminUser } from '../services/api';

export default function MyTicketsScreen({ navigation, route }) {
  const params = route.params || {};
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const employeeId = params.employeeId;
  const userId = params.userId;
  const overdueOnly = params.overdueOnly === true;
  const employeeName = params.employeeName;

  useEffect(() => {
    const loadTickets = async () => {
      let currentUser;
      try {
        currentUser = await getCurrentUser();
      } catch (error) {
        await clearSession();
        navigation.replace('Welcome');
        Alert.alert('Session expired', 'Please sign in again.');
        return;
      }

      const actualAdmin = isAdminUser(currentUser);
      if (params.isAdmin === true && !actualAdmin) {
        navigation.replace('UserDashboard');
        return;
      }

      setIsAdmin(actualAdmin);

      try {
        setLoading(true);
        const data = overdueOnly ? await getOverdueTickets() : await fetchTickets();
        const visible = userId
          ? data.filter((ticket) => {
            const requesterId = ticket.requester?._id || ticket.requester;
            const assigneeId = ticket.assignee?._id || ticket.assignee;
            return String(requesterId) === String(userId) || String(assigneeId) === String(userId);
          })
          : employeeId
            ? data.filter((ticket) => ticket.assignee === employeeId || ticket.requester === employeeId)
          : data;
        setTickets(visible);
      } catch (error) {
        Alert.alert('Unable to load tickets', error.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();

    const unsubscribe = navigation.addListener('focus', () => {
      loadTickets();
    });

    return unsubscribe;
  }, [navigation, employeeId, userId, params.isAdmin, overdueOnly]);

  const heading = employeeName
    ? `${employeeName}'s Tickets`
    : overdueOnly
      ? 'Overdue Tickets'
    : isAdmin
      ? 'Manage All Tickets'
      : 'My Tickets';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{heading}</Text>

      <Text style={styles.subtitle}>
        {isAdmin
          ? employeeName
            ? 'View and manage this employee’s reported issues.'
            : overdueOnly
              ? 'Tickets past their SLA deadline and still unresolved.'
              : 'Review, assign and update employee issues.'
          : 'Track the status of your reported issues.'}
      </Text>

      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>{tickets.length}</Text>
        <Text style={styles.summaryLabel}>
          {isAdmin ? 'Tickets to manage' : 'Tickets displayed'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Loading tickets...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No tickets found</Text>
          <Text style={styles.emptyText}>
            There are no tickets to display for this selection.
          </Text>
        </View>
      ) : (
        tickets.map((ticket) => (
          <Pressable
            key={ticket.id}
            style={styles.card}
            onPress={() => navigation.navigate('TicketDetails', { ticket, isAdmin })}
          >
            <View style={styles.row}>
              <Text style={styles.id}>{ticket.id}</Text>
              <Text
                style={[
                  styles.status,
                  ticket.status === 'Resolved'
                    ? styles.resolved
                    : ticket.status === 'Pending' || ticket.status === 'Open'
                      ? styles.pending
                      : styles.progress,
                ]}
              >
                {ticket.status}
              </Text>
            </View>

            <Text style={styles.title}>{ticket.title}</Text>

            {isAdmin && (
              <Text style={styles.employee}>
                Reported by: {ticket.requester?.name || 'Employee'}
              </Text>
            )}

            <Text style={styles.category}>{ticket.category}</Text>
            <Text style={styles.priority}>Priority: {ticket.priority}</Text>

            <Text style={styles.openDetails}>View details →</Text>
          </Pressable>
        ))
      )}

      {!isAdmin && (
        <Pressable
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Text style={styles.createButtonText}>＋ Raise New Ticket</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172554',
  },
  subtitle: {
    color: '#64748B',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 21,
  },
  summary: {
    backgroundColor: '#DBEAFE',
    padding: 17,
    borderRadius: 12,
    marginBottom: 18,
  },
  summaryNumber: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  summaryLabel: {
    color: '#1E40AF',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: {
    color: '#64748B',
    fontSize: 13,
  },
  status: {
    fontWeight: '600',
    fontSize: 12,
  },
  pending: {
    color: '#D97706',
  },
  progress: {
    color: '#2563EB',
  },
  resolved: {
    color: '#059669',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172554',
    marginTop: 12,
  },
  employee: {
    color: '#475569',
    marginTop: 7,
  },
  category: {
    color: '#64748B',
    marginTop: 7,
  },
  priority: {
    color: '#64748B',
    marginTop: 6,
  },
  openDetails: {
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: 13,
  },
  createButton: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172554',
  },
  emptyText: {
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});
