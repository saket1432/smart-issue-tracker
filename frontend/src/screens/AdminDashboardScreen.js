
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { getApiHealth, getDashboardStats, getOverdueTickets, getServerStatus, clearSession, isAdminUser, getCurrentUser } from '../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    pendingTickets: 0,
    inProgress: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    overdueTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState({ server: false, health: false });

  useEffect(() => {
    const validateAdminAccess = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!isAdminUser(currentUser)) {
          await clearSession();
          Alert.alert('Access denied', 'Admin privileges are required to open this dashboard.');
          navigation.replace('Welcome');
          return;
        }
      } catch (error) {
        await clearSession();
        Alert.alert('Session expired', 'Please sign in again.');
        navigation.replace('Welcome');
        return;
      }

      const loadAdminData = async () => {
        try {
          setLoading(true);
          const [overdueItems, dashboardStats, healthChecks] = await Promise.all([
            getOverdueTickets(),
            getDashboardStats(),
            Promise.allSettled([getServerStatus(), getApiHealth()]),
          ]);

          setServiceStatus({
            server: healthChecks[0].status === 'fulfilled',
            health: healthChecks[1].status === 'fulfilled' && healthChecks[1].value.status === 'ok',
          });
          setStats({
            totalTickets: dashboardStats.totalTickets || 0,
            openTickets: dashboardStats.openTickets || 0,
            pendingTickets: dashboardStats.pendingTickets || 0,
            inProgress: dashboardStats.inProgress || 0,
            resolvedTickets: dashboardStats.resolvedTickets || 0,
            closedTickets: dashboardStats.closedTickets || 0,
            overdueTickets: overdueItems.length,
          });
        } catch (error) {
          Alert.alert('Unable to load admin data', error.message || 'Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      await loadAdminData();
    };

    validateAdminAccess();
    const unsubscribe = navigation.addListener('focus', validateAdminAccess);
    return unsubscribe;
  }, [navigation]);

  const sections = [
    {
      icon: '📋',
      title: 'Manage All Tickets',
      description: 'View, assign, prioritize and update issues',
      route: 'MyTickets',
    },
    {
      icon: '👥',
      title: 'Manage Users',
      description: 'View employee details and their tickets',
      route: 'UserManagement',
    },
    {
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'Review resolution rates and overdue issues',
      route: 'Reports',
    },
    {
      icon: '⏱️',
      title: 'SLA Policies',
      description: 'Set support response and resolution targets',
      route: 'SlaManagement',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'View ticket updates and alerts',
      route: 'Notifications',
    },
    {
      icon: '👤',
      title: 'Admin Profile',
      description: 'View account information',
      route: 'Profile',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>ADMIN PANEL</Text>
      <Text style={styles.heading}>Issue Management</Text>
      <Text style={styles.subtitle}>
        Monitor employee issues and manage resolution from one place.
      </Text>

      <View style={styles.healthCard}>
        <Text style={styles.healthText}>API server: {serviceStatus.server ? 'Online' : 'Unavailable'}</Text>
        <Text style={styles.healthText}>Backend health: {serviceStatus.health ? 'Healthy' : 'Unavailable'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.number}>{loading ? '...' : stats.totalTickets}</Text>
          <Text style={styles.statLabel}>Total Tickets</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.number, { color: '#D97706' }]}>{loading ? '...' : stats.openTickets}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.number, { color: '#B45309' }]}>{loading ? '...' : stats.pendingTickets}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.number, { color: '#2563EB' }]}>{loading ? '...' : stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.number, { color: '#059669' }]}>{loading ? '...' : stats.resolvedTickets}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.number}>{loading ? '...' : stats.closedTickets}</Text>
          <Text style={styles.statLabel}>Closed</Text>
        </View>
      </View>

      <Pressable
        style={styles.alertCard}
        onPress={() => navigation.navigate('MyTickets', { overdueOnly: true })}
      >
        <Text style={styles.alertTitle}>⚠️  Overdue Issues</Text>
        <Text style={styles.alertDescription}>
          {loading ? 'Loading overdue tickets...' : `${stats.overdueTickets} tickets need immediate attention.`}
        </Text>
        <Text style={styles.alertLink}>Review tickets →</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Administration</Text>

      {sections.map((item) => (
        <Pressable
          key={item.route}
          style={styles.menuCard}
          onPress={() => navigation.navigate(item.route)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>
              {item.description}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
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
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  greeting: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#172554',
    marginTop: 7,
  },
  subtitle: {
    color: '#64748B',
    marginTop: 8,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 22,
  },
  healthCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginTop: 16 },
  healthText: { color: '#475569', fontSize: 13, marginVertical: 2 },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
  },
  number: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#172554',
  },
  statLabel: {
    color: '#64748B',
    marginTop: 5,
  },
  alertCard: {
    backgroundColor: '#FFF7ED',
    padding: 17,
    borderRadius: 13,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  alertTitle: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertDescription: {
    color: '#9A3412',
    lineHeight: 21,
    marginTop: 8,
  },
  alertLink: {
    color: '#C2410C',
    fontWeight: 'bold',
    marginTop: 12,
  },
  sectionTitle: {
    color: '#172554',
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 25,
    marginRight: 13,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: '#172554',
    fontWeight: 'bold',
    fontSize: 15,
  },
  menuDescription: {
    color: '#64748B',
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 25,
    color: '#64748B',
    marginLeft: 8,
  },
  logout: {
    alignItems: 'center',
    padding: 17,
    marginTop: 12,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});
