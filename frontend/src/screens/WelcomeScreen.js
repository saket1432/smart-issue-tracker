
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✓</Text>
      </View>

      <Text style={styles.title}>Smart Issue Tracker</Text>
      <Text style={styles.subtitle}>
        Report issues, track progress, and resolve problems smarter.
      </Text>

      <Pressable
        style={styles.primary}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.primaryText}>Get Started</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate('UserLogin')}
      >
        <Text style={styles.secondaryText}>User Login</Text>
      </Pressable>

      <Pressable
        style={styles.admin}
        onPress={() => navigation.navigate('AdminLogin')}
      >
        <Text style={styles.adminText}>Admin Login</Text>
      </Pressable>

      <Text style={styles.footer}>A smarter way to manage workplace issues.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#F5F7FB' },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
  icon: { color: '#2563EB', fontSize: 42, fontWeight: 'bold' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#172554', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginTop: 12, marginBottom: 32 },
  primary: { backgroundColor: '#2563EB', padding: 17, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  secondary: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 13, borderWidth: 1, borderColor: '#CBD5E1' },
  secondaryText: { color: '#172554', fontWeight: 'bold', fontSize: 16 },
  admin: { padding: 16, alignItems: 'center', marginTop: 5 },
  adminText: { color: '#2563EB', fontWeight: 'bold', fontSize: 16 },
  footer: { textAlign: 'center', color: '#94A3B8', marginTop: 30 },
});
