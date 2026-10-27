
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import { fetchTickets, getAdminStats, clearSession, isAdminUser, getCurrentUser } from '../services/api';

const reportData = [
  {
    title: 'Total Tickets',
    description: 'All reported issues',
    color: '#2563EB',
  },
  {
    title: 'Resolved Tickets',
    description: 'Successfully resolved',
    color: '#059669',
  },
  {
    title: 'Open Tickets',
    description: 'Currently awaiting action',
    color: '#D97706',
  },
  {
    title: 'Pending Tickets',
    description: 'Waiting for the next action',
    color: '#B45309',
  },
  {
    title: 'In Progress',
    description: 'Currently being handled',
    color: '#7C3AED',
  },
  {
    title: 'Overdue Tickets',
    description: 'Past their target deadline',
    color: '#DC2626',
  },
];

export default function ReportsScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    pendingTickets: 0,
    inProgress: 0,
    resolvedTickets: 0,
    overdueTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAndLoadStats = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!isAdminUser(currentUser)) {
          await clearSession();
          Alert.alert('Access denied', 'Admin privileges are required to view reports.');
          navigation.replace('Welcome');
          return;
        }
      } catch (error) {
        await clearSession();
        Alert.alert('Session expired', 'Please sign in again.');
        navigation.replace('Welcome');
        return;
      }

      try {
        setLoading(true);
        const [data, tickets] = await Promise.all([getAdminStats(), fetchTickets()]);
        setStats({
          totalTickets: tickets.length,
          openTickets: tickets.filter((ticket) => ticket.status === 'Open').length,
          pendingTickets: tickets.filter((ticket) => ticket.status === 'Pending').length,
          inProgress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
          resolvedTickets: tickets.filter((ticket) => ticket.status === 'Resolved').length,
          overdueTickets: data.overdueTickets || 0,
        });
      } catch (error) {
        Alert.alert('Unable to load reports', error.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadStats();
  }, [navigation]);

  const total = stats.totalTickets;
  const resolved = stats.resolvedTickets || 0;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Reports & Analytics</Text>

      <Text style={styles.subtitle}>
        Monitor ticket performance and issue resolution.
      </Text>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>Resolution Rate</Text>
        <Text style={styles.highlightValue}>{loading ? '...' : `${resolutionRate}%`}</Text>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${loading ? 0 : resolutionRate}%` },
            ]}
          />
        </View>
        <Text style={styles.highlightDescription}>
          {loading ? 'Loading reports...' : `${resolved} of ${total} tickets resolved`}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Ticket Overview</Text>

      {reportData.map((item) => {
        const value = (() => {
          switch (item.title) {
            case 'Total Tickets': return stats.totalTickets;
            case 'Resolved Tickets': return stats.resolvedTickets;
            case 'Open Tickets': return stats.openTickets;
            case 'Pending Tickets': return stats.pendingTickets;
            case 'In Progress': return stats.inProgress;
            case 'Overdue Tickets': return stats.overdueTickets;
            default: return 0;
          }
        })();

        return (
          <View key={item.title} style={styles.card}>
            <View
              style={[
                styles.indicator,
                { backgroundColor: item.color },
              ]}
            />

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>
                {item.description}
              </Text>
            </View>

            <Text style={[styles.cardValue, { color: item.color }]}>
              {loading ? '...' : value}
            </Text>
          </View>
        );
      })}

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Admin Insight</Text>
        <Text style={styles.noteText}>
          Review pending and overdue tickets regularly to improve
          resolution time and employee satisfaction.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#172554',
  },
  subtitle: {
    color: '#64748B',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 21,
  },
  highlightCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 25,
  },
  highlightLabel: {
    color: '#64748B',
    fontSize: 15,
  },
  highlightValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 8,
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  highlightDescription: {
    color: '#64748B',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#172554',
    marginBottom: 13,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  indicator: {
    width: 5,
    height: 45,
    borderRadius: 5,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#172554',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },
  cardValue: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noteCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 17,
    marginTop: 12,
  },
  noteTitle: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteText: {
    color: '#1E40AF',
    lineHeight: 21,
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 20,
  },
});
