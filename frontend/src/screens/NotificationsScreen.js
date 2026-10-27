
import React, { useEffect, useState } from 'react';
import { Text, ScrollView, StyleSheet, View, Alert } from 'react-native';

import { getNotifications } from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        Alert.alert('Unable to load notifications', error.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    const unsubscribe = navigation.addListener('focus', loadNotifications);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      {loading ? (
        <Text style={styles.empty}>Loading notifications...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : notifications.map((item) => (
        <View key={item._id || item.id} style={styles.card}>
          <Text style={styles.title}>🔔  {item.type || 'Ticket update'}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString() || 'Today'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#172554', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 17, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#172554' },
  message: { color: '#475569', marginTop: 10, lineHeight: 21 },
  time: { color: '#94A3B8', fontSize: 12, marginTop: 10 },
});
