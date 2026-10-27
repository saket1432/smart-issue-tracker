
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { clearSession, getCurrentUser, updateCurrentUser } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', employeeId: '', department: '', phone: '' });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const apiUser = await getCurrentUser();
        setUser(apiUser);
        setProfileDraft({
          name: apiUser?.name || '',
          employeeId: apiUser?.employeeId || '',
          department: apiUser?.department || '',
          phone: apiUser?.phone || '',
        });
      } catch (error) {
        if (error.message?.includes('Not authorized') || error.message?.includes('token')) {
          await clearSession();
          navigation.replace('Welcome');
        }
        Alert.alert('Unable to load profile', error.message || 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigation]);

  if (loading) {
    return <View style={styles.container}><Text style={styles.email}>Loading profile…</Text></View>;
  }

  if (!user) {
    return <View style={styles.container}><Text style={styles.email}>Profile unavailable.</Text></View>;
  }

  const saveProfile = async () => {
    try {
      setSaving(true);
      const updatedUser = await updateCurrentUser({
        name: profileDraft.name.trim(),
        employeeId: profileDraft.employeeId.trim(),
        department: profileDraft.department.trim(),
        phone: profileDraft.phone.trim(),
      });
      if (updatedUser) setUser(updatedUser);
      setEditing(false);
      Alert.alert('Profile updated', 'Your changes were saved.');
    } catch (error) {
      Alert.alert('Unable to update profile', error.message || 'Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (field, value) => {
    setProfileDraft((current) => ({ ...current, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
      </View>

      {editing
        ? <TextInput style={styles.nameInput} value={profileDraft.name} onChangeText={(value) => updateDraft('name', value)} />
        : <Text style={styles.name}>{user.name}</Text>}
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Employee ID</Text>
        {editing ? <TextInput style={styles.input} value={profileDraft.employeeId} onChangeText={(value) => updateDraft('employeeId', value)} /> : <Text style={styles.value}>{user.employeeId || 'N/A'}</Text>}
        <Text style={styles.label}>Department</Text>
        {editing ? <TextInput style={styles.input} value={profileDraft.department} onChangeText={(value) => updateDraft('department', value)} /> : <Text style={styles.value}>{user.department || 'N/A'}</Text>}
        <Text style={styles.label}>Phone</Text>
        {editing ? <TextInput style={styles.input} value={profileDraft.phone} onChangeText={(value) => updateDraft('phone', value)} keyboardType="phone-pad" /> : <Text style={styles.value}>{user.phone || 'N/A'}</Text>}
        <Text style={styles.label}>Account Role</Text>
        <Text style={styles.value}>{user.role === 'admin' ? 'Admin' : 'User'}</Text>
      </View>

      <Pressable
        style={styles.button}
        disabled={saving}
        onPress={() => editing ? saveProfile() : setEditing(true)}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving…' : editing ? 'Save Profile' : 'Edit Profile'}</Text>
      </Pressable>

      {editing && <Pressable style={styles.cancelButton} onPress={() => {
        setProfileDraft({ name: user.name || '', employeeId: user.employeeId || '', department: user.department || '', phone: user.phone || '' });
        setEditing(false);
      }}><Text style={styles.cancelText}>Cancel</Text></Pressable>}

      <Pressable
        style={styles.logout}
        onPress={async () => {
          await clearSession();
          navigation.replace('Welcome');
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, alignItems: 'center' },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  avatarText: { fontSize: 35, fontWeight: 'bold', color: '#2563EB' },
  name: { fontSize: 23, fontWeight: 'bold', color: '#172554', marginTop: 15 },
  nameInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginTop: 15, width: '100%', color: '#172554', textAlign: 'center' },
  email: { color: '#64748B', marginTop: 5 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, width: '100%', marginTop: 25 },
  label: { color: '#64748B', marginTop: 12 },
  value: { color: '#172554', fontSize: 16, marginTop: 5 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginTop: 5, color: '#172554' },
  button: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold' },
  cancelButton: { padding: 12 },
  cancelText: { color: '#64748B', textAlign: 'center' },
  logout: { padding: 17 },
  logoutText: { color: '#DC2626', fontWeight: 'bold' },
});
