
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    email.includes('@') &&
    employeeId.trim() !== '' &&
    department !== '' &&
    phone.trim().length >= 10 &&
    password.length >= 6 &&
    confirmPassword === password;

  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert(
        'Invalid Details',
        'Please fill in all fields correctly.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const normalizedEmail = email.trim().toLowerCase();
      await registerUser({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'user',
        employeeId: employeeId.trim(),
        department,
        phone: phone.trim(),
      });

      Alert.alert(
        'Registration Successful',
        `Welcome, ${name}! Your account has been created.`,
        [
          {
            text: 'Continue to Login',
            onPress: () => navigation.navigate(
              'UserLogin',
            ),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Enter your details to get started.
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Employee ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your employee ID"
        value={employeeId}
        onChangeText={setEmployeeId}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Department</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={department}
          onValueChange={setDepartment}
        >
          <Picker.Item label="Select department" value="" />
          <Picker.Item label="Engineering" value="Engineering" />
          <Picker.Item label="IT Support" value="IT Support" />
          <Picker.Item label="Human Resources" value="Human Resources" />
          <Picker.Item label="Operations" value="Operations" />
          <Picker.Item label="Finance" value="Finance" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="At least 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        style={[
          styles.button,
          (!isFormValid || isSubmitting) && styles.disabledButton,
        ]}
        disabled={!isFormValid || isSubmitting}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Creating...' : 'Create Account'}</Text>
      </Pressable>

      <Pressable
        style={styles.loginLink}
        onPress={() => navigation.navigate('UserLogin')}
      >
        <Text style={styles.loginText}>
          Already registered? Sign in
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    padding: 22,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#172554',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DFEA',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#172554',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DFEA',
    borderRadius: 11,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 11,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
