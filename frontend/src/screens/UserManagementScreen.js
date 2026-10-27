
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

import { countTicketsReportedBy, fetchTickets, getAdminUsers, clearSession, isAdminUser, getCurrentUser, updateAdminUser } from '../services/api';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userDraft, setUserDraft] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const validateAndLoadUsers = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!isAdminUser(currentUser)) {
          await clearSession();
          Alert.alert('Access denied', 'Admin privileges are required to manage users.');
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
        const [data, tickets] = await Promise.all([getAdminUsers(), fetchTickets()]);
        const normalizedUsers = data.map((user) => ({
          // Employee IDs are editable and aren't guaranteed to be unique. Use
          // the database ID for React identity so one account can't hide another.
          userId: user._id,
          key: user._id || user.email,
          id: user.employeeId || user._id || user.email || 'ID unavailable',
          employeeId: user.employeeId || '',
          phone: user.phone || '',
          name: user.name || 'Unknown User',
          email: user.email || 'N/A',
          department: user.department || 'N/A',
          role: user.role || 'user',
          ticketCount: countTicketsReportedBy(tickets, user._id),
        }));

        setUsers(normalizedUsers);
      } catch (error) {
        Alert.alert('Unable to load users', error.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadUsers();
    const unsubscribe = navigation.addListener('focus', validateAndLoadUsers);
    return unsubscribe;
  }, [navigation]);

  const startEditing = (user) => {
    setEditingUserId(user.userId);
    setUserDraft({
      name: user.name === 'Unknown User' ? '' : user.name,
      email: user.email === 'N/A' ? '' : user.email,
      employeeId: user.employeeId,
      department: user.department === 'N/A' ? '' : user.department,
      phone: user.phone,
    });
  };

  const saveUser = async (user) => {
    try {
      setUpdatingUserId(user.userId);
      const updated = await updateAdminUser(user.userId, userDraft);
      setUsers((current) => current.map((item) => (
        item.userId === user.userId
          ? {
            ...item,
            name: updated.name,
            email: updated.email,
            employeeId: updated.employeeId || '',
            id: updated.employeeId || updated._id || updated.email,
            department: updated.department || '',
            phone: updated.phone || '',
          }
          : item
      )));
      setEditingUserId(null);
      setUserDraft({});
    } catch (error) {
      Alert.alert('Unable to update user', error.message || 'Please try again later.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const renderEditField = (label, field) => (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}</Text>
      <TextInput
        style={styles.editInput}
        value={userDraft[field] || ''}
        onChangeText={(value) => setUserDraft((current) => ({ ...current, [field]: value }))}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Users</Text>
      <Text style={styles.subtitle}>
        View registered accounts and the tickets each person reported.
      </Text>

      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>{loading ? '...' : users.length}</Text>
        <Text style={styles.summaryLabel}>Registered accounts</Text>
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Loading users...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No registered accounts found</Text>
          <Text style={styles.emptyText}>
            Employee records will appear here when available.
          </Text>
        </View>
      ) : (
        users.map((user) => (
          <View key={user.key} style={styles.card}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.userDetails}>
                {editingUserId === user.userId ? (
                  <>
                    {renderEditField('Name', 'name')}
                    {renderEditField('Email', 'email')}
                    {renderEditField('Employee ID', 'employeeId')}
                    {renderEditField('Department', 'department')}
                    {renderEditField('Phone', 'phone')}
                  </>
                ) : (
                  <>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.info}>{user.id}</Text>
                    <Text style={styles.info}>{user.email}</Text>
                    <Text style={styles.info}>Role: {user.role === 'admin' ? 'Admin' : 'User'}</Text>
                    <Text style={styles.info}>Department: {user.department}</Text>
                    <Text style={styles.info}>Phone: {user.phone || 'N/A'}</Text>
                  </>
                )}
                <Text style={styles.ticketCount}>{user.ticketCount} tickets reported</Text>
              </View>
            </View>

            <Pressable
              style={styles.viewButton}
              onPress={() =>
                navigation.navigate('MyTickets', {
                  userId: user.userId,
                  employeeId: user.id,
                  employeeName: user.name,
                  isAdmin: true,
                })
              }
            >
              <Text style={styles.viewButtonText}>
                View User Tickets
              </Text>
            </Pressable>

            <Pressable
              style={styles.roleButton}
              disabled={updatingUserId === user.userId}
              onPress={() => editingUserId === user.userId ? saveUser(user) : startEditing(user)}
            >
              <Text style={styles.roleButtonText}>
                {updatingUserId === user.userId
                  ? 'Saving user…'
                  : editingUserId === user.userId ? 'Save User Details' : 'Edit User Details'}
              </Text>
            </Pressable>
            {editingUserId === user.userId && (
              <Pressable
                style={styles.cancelButton}
                disabled={updatingUserId === user.userId}
                onPress={() => { setEditingUserId(null); setUserDraft({}); }}
              >
                <Text style={styles.roleButtonText}>Cancel</Text>
              </Pressable>
            )}

          </View>
        ))
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
  summary: {
    backgroundColor: '#DBEAFE',
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  summaryLabel: {
    color: '#1E40AF',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 16,
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  userDetails: {
    flex: 1,
  },
  editField: {
    marginBottom: 8,
  },
  editLabel: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#172554',
  },
  name: {
    color: '#172554',
    fontSize: 17,
    fontWeight: 'bold',
  },
  info: {
    color: '#64748B',
    marginTop: 5,
    fontSize: 13,
  },
  ticketCount: {
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: '#2563EB',
    borderRadius: 9,
    alignItems: 'center',
    padding: 12,
    marginTop: 17,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  roleButton: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 9,
    alignItems: 'center',
    padding: 12,
    marginTop: 9,
  },
  roleButtonText: { color: '#334155', fontWeight: '600' },
  cancelButton: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 9,
    alignItems: 'center',
    padding: 12,
    marginTop: 9,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 9,
    alignItems: 'center',
    padding: 12,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#B91C1C',
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
    textAlign: 'center',
    marginTop: 8,
  },
});
