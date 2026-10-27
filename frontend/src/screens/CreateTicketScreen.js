
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createTicket } from '../services/api';

export default function CreateTicketScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impact, setImpact] = useState('Medium');
  const [urgency, setUrgency] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Function to handle ticket submission
  const submitTicket = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Missing Details', 'Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const impactScore = { Low: 1, Medium: 2, High: 3 }[impact] || 2;
      const urgencyScore = { Low: 1, Medium: 2, High: 3 }[urgency] || 2;
      const priorityValue = { Low: 'low', Medium: 'medium', High: 'high' }[impact] || 'medium';

      const result = await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority: priorityValue,
        impact: impactScore,
        urgency: urgencyScore,
      });

      const duplicateMessage = result.duplicateMatches.length
        ? result.ticket.status === 'Resolved'
          ? `This looks similar to ${result.duplicateMatches.map((match) => match.title).join(', ')}. The existing resolution was added to your ticket: ${result.ticket.resolutionNotes}\n\n`
          : `This looks similar to ${result.duplicateMatches.map((match) => match.title).join(', ')}. It has been linked as a duplicate. When the main issue is resolved, this ticket will receive the same resolution.\n\n`
        : '';
      Alert.alert(
        result.duplicateMatches.length ? 'Ticket linked to a similar issue' : 'Ticket Created',
        `${duplicateMessage}Your issue has been submitted successfully.`,
        [{
          text: 'View Ticket',
          onPress: () => navigation.replace('TicketDetails', { ticket: result.ticket }),
        }],
      );
    } catch (error) {
      Alert.alert('Ticket Creation Failed', error.message || 'Unable to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Report an Issue</Text>
      <Text style={styles.subtitle}>
        Describe the issue clearly so it can be resolved faster.
      </Text>

      <Text style={styles.label}>Issue Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Laptop not working"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.picker}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          <Picker.Item label="Select category" value="" />
          <Picker.Item label="Hardware" value="Hardware" />
          <Picker.Item label="Software" value="Software" />
          <Picker.Item label="Network" value="Network" />
          <Picker.Item label="Account / Access" value="Account / Access" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Explain what happened and any error messages..."
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Impact</Text>
      <View style={styles.picker}>
        <Picker selectedValue={impact} onValueChange={setImpact}>
          <Picker.Item label="Low" value="Low" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="High" value="High" />
        </Picker>
      </View>

      <Text style={styles.label}>Urgency</Text>
      <View style={styles.picker}>
        <Picker selectedValue={urgency} onValueChange={setUrgency}>
          <Picker.Item label="Low" value="Low" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="High" value="High" />
        </Picker>
      </View>

      <Pressable style={styles.button} onPress={submitTicket} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 35 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#172554' },
  subtitle: { color: '#64748B', marginTop: 8, marginBottom: 20 },
  label: { fontWeight: '600', color: '#334155', marginBottom: 7, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15,
  },
  multiline: { minHeight: 120 },
  picker: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 10, overflow: 'hidden',
  },
  button: {
    backgroundColor: '#2563EB', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 25,
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
