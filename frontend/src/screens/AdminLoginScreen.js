
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
} from 'react-native';
import { loginUser, saveSession, isAdminUser } from '../services/api';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Details', 'Enter your admin email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginUser({ email: email.trim().toLowerCase(), password });
      if (!isAdminUser(response.user)) {
        Alert.alert('Access denied', 'This account does not have admin privileges. Use User Login instead.');
        return;
      }
      await saveSession(response.token, response.user);
      navigation.replace('AdminDashboard');
    } catch (error) {
      Alert.alert('Admin Login Failed', error.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Login</Text>
      <Text style={styles.subtitle}>Sign in to manage issue resolution.</Text>
      <Text style={styles.label}>Admin Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter admin email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={login} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Logging in...' : 'Login as Admin'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 27, fontWeight: 'bold', color: '#172554' },
  subtitle: { color: '#64748B', marginTop: 8, marginBottom: 25 },
  label: { color: '#334155', fontWeight: '600', marginBottom: 7, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14 },
  button: { backgroundColor: '#172554', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 25 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
