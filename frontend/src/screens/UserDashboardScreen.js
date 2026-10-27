
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { clearSession, fetchTickets, getCurrentUser, getDashboardStats, isAdminUser } from '../services/api';

export default function UserDashboardScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ totalTickets: 0, openTickets: 0, pendingTickets: 0, resolvedTickets: 0 });
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (isAdminUser(currentUser)) {
        navigation.replace('AdminDashboard');
        return;
      }

      setLoading(true);
      const [dashboardStats, data] = await Promise.all([getDashboardStats(), fetchTickets()]);
      setStats(dashboardStats);
      setTickets(data);
    } catch (error) {
      if (error.message?.includes('Not authorized') || error.message?.includes('token')) {
        await clearSession();
        navigation.replace('Welcome');
      }
      Alert.alert('Unable to load tickets', error.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadTickets();

    const unsubscribe = navigation.addListener('focus', async () => {
      await loadTickets();
    });

    return unsubscribe;
  }, [loadTickets, navigation]);

  const openTicket = (ticket) => navigation.navigate('TicketDetails', { ticket });

  const totalRaised = stats.totalTickets || 0;
  const pendingCount = (stats.openTickets || 0) + (stats.pendingTickets || 0);
  const resolvedCount = stats.resolvedTickets || 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hello! 👋</Text>
      <Text style={styles.heading}>Welcome to Smart Issue Tracker</Text>
      <Text style={styles.subtitle}>
        Raise issues and track their progress in one place.
      </Text>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.number}>{totalRaised}</Text>
          <Text style={styles.statLabel}>Raised</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.number}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Awaiting Action</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.number}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Text style={styles.buttonText}>＋  Create New Ticket</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      {[
        ['📋', 'My Tickets', 'MyTickets'],
        ['🔔', 'Notifications', 'Notifications'],
        ['👤', 'My Profile', 'Profile'],
      ].map(([emoji, label, route]) => (
        <Pressable
          key={route}
          style={styles.action}
          onPress={() => navigation.navigate(route)}
        >
          <Text style={styles.actionText}>{emoji}  {label}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>Recent Tickets</Text>
      {loading ? (
        <Text style={styles.emptyText}>Loading tickets...</Text>
      ) : tickets.length === 0 ? (
        <Text style={styles.emptyText}>No tickets found yet.</Text>
      ) : tickets.slice(0, 5).map((ticket) => (
        <Pressable
          key={ticket.id}
          style={styles.ticket}
          onPress={() => openTicket(ticket)}
        >
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
          <Text style={styles.ticketId}>{ticket.id}</Text>
          <Text style={{ color: ticket.color, marginTop: 6 }}>
            ● {ticket.status}
          </Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.logout}
        onPress={async () => {
          await clearSession();
          navigation.replace('Welcome');
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 35 },
  greeting: { fontSize: 17, color: '#64748B' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#172554', marginTop: 6 },
  subtitle: { color: '#64748B', marginTop: 8, lineHeight: 21 },
  stats: { flexDirection: 'row', gap: 10, marginVertical: 22 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 15, alignItems: 'center',
  },
  number: { fontSize: 25, fontWeight: 'bold', color: '#2563EB' },
  statLabel: { color: '#64748B', marginTop: 5 },
  primaryButton: {
    backgroundColor: '#2563EB', padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#172554',
    marginTop: 25, marginBottom: 12,
  },
  action: {
    backgroundColor: '#FFFFFF', padding: 17, borderRadius: 10,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
  },
  actionText: { fontSize: 15, color: '#172554' },
  arrow: { fontSize: 22, color: '#64748B' },
  ticket: {
    backgroundColor: '#FFFFFF', padding: 16,
    borderRadius: 12, marginBottom: 10,
  },
  ticketTitle: { fontSize: 16, fontWeight: 'bold', color: '#172554' },
  ticketId: { color: '#64748B', marginTop: 5 },
  logout: { alignItems: 'center', marginTop: 25, padding: 14 },
  logoutText: { color: '#DC2626', fontWeight: 'bold' },
});
