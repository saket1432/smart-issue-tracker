import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  clearSession,
  createSlaPolicy,
  getCurrentUser,
  getSlaPolicies,
  isAdminUser,
  updateSlaPolicy,
} from '../services/api';

const EMPTY_POLICY = { name: '', responseHours: '', resolutionHours: '', isDefault: false };

export default function SlaManagementScreen({ navigation }) {
  const [policies, setPolicies] = useState([]);
  const [draft, setDraft] = useState(EMPTY_POLICY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPolicies = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!isAdminUser(currentUser)) {
        await clearSession();
        Alert.alert('Access denied', 'Admin privileges are required to manage SLA policies.');
        navigation.replace('Welcome');
        return;
      }
      setPolicies(await getSlaPolicies());
    } catch (error) {
      if (error.message?.includes('Not authorized') || error.message?.includes('token')) {
        await clearSession();
        navigation.replace('Welcome');
      }
      Alert.alert('Unable to load SLA policies', error.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadPolicies();
    const unsubscribe = navigation.addListener('focus', loadPolicies);
    return unsubscribe;
  }, [loadPolicies, navigation]);

  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setDraft(EMPTY_POLICY);
    setEditingId(null);
  };

  const editPolicy = (policy) => {
    setEditingId(policy._id);
    setDraft({
      name: policy.name || '',
      responseHours: String(policy.responseHours ?? ''),
      resolutionHours: String(policy.resolutionHours ?? ''),
      isDefault: Boolean(policy.isDefault),
    });
  };

  const savePolicy = async () => {
    const responseHours = Number(draft.responseHours);
    const resolutionHours = Number(draft.resolutionHours);
    if (!draft.name.trim() || !Number.isFinite(responseHours) || responseHours <= 0
      || !Number.isFinite(resolutionHours) || resolutionHours <= 0) {
      Alert.alert('Invalid policy', 'Enter a name and positive response and resolution hours.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: draft.name.trim(),
        responseHours,
        resolutionHours,
        isDefault: Boolean(draft.isDefault),
      };
      let savedPolicy;
      if (editingId) {
        savedPolicy = await updateSlaPolicy(editingId, payload);
      } else {
        savedPolicy = await createSlaPolicy(payload);
      }

      if (payload.isDefault && savedPolicy?._id) {
        const otherDefaults = policies.filter((policy) => policy.isDefault && policy._id !== savedPolicy._id);
        await Promise.all(otherDefaults.map((policy) => updateSlaPolicy(policy._id, { isDefault: false })));
      }
      resetForm();
      await loadPolicies();
    } catch (error) {
      Alert.alert('Unable to save SLA policy', error.message || 'Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>SLA Policies</Text>
      <Text style={styles.subtitle}>Set response and resolution targets for the support team.</Text>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{editingId ? 'Edit Policy' : 'Create Policy'}</Text>
        <TextInput style={styles.input} value={draft.name} onChangeText={(value) => setField('name', value)} placeholder="Policy name" />
        <TextInput style={styles.input} value={draft.responseHours} onChangeText={(value) => setField('responseHours', value)} placeholder="Response hours" keyboardType="numeric" />
        <TextInput style={styles.input} value={draft.resolutionHours} onChangeText={(value) => setField('resolutionHours', value)} placeholder="Resolution hours" keyboardType="numeric" />
        <Pressable style={styles.defaultToggle} onPress={() => setField('isDefault', !draft.isDefault)}>
          <Text style={styles.defaultToggleText}>{draft.isDefault ? '✓  Default policy' : 'Set as default policy'}</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} disabled={saving} onPress={savePolicy}>
          <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Policy'}</Text>
        </Pressable>
        {editingId && <Pressable style={styles.cancelButton} onPress={resetForm}><Text style={styles.cancelText}>Cancel edit</Text></Pressable>}
      </View>

      <Text style={styles.sectionTitle}>Current Policies</Text>
      {loading ? (
        <Text style={styles.emptyText}>Loading policies…</Text>
      ) : policies.length === 0 ? (
        <Text style={styles.emptyText}>No SLA policies have been created.</Text>
      ) : policies.map((policy) => (
        <View style={styles.policyCard} key={policy._id}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyName}>{policy.name}</Text>
            {policy.isDefault && <Text style={styles.defaultBadge}>DEFAULT</Text>}
          </View>
          <Text style={styles.policyDetails}>Response: {policy.responseHours} hours</Text>
          <Text style={styles.policyDetails}>Resolution: {policy.resolutionHours} hours</Text>
          <Pressable style={styles.editButton} onPress={() => editPolicy(policy)}>
            <Text style={styles.editButtonText}>Edit Policy</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 35 },
  heading: { color: '#172554', fontSize: 25, fontWeight: 'bold' },
  subtitle: { color: '#64748B', marginTop: 8, marginBottom: 18, lineHeight: 21 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  formTitle: { color: '#172554', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9, padding: 12, marginTop: 10, color: '#172554' },
  defaultToggle: { paddingVertical: 12 },
  defaultToggleText: { color: '#334155', fontWeight: '600' },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 5 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  cancelButton: { padding: 10 },
  cancelText: { color: '#64748B', textAlign: 'center' },
  sectionTitle: { color: '#172554', fontSize: 19, fontWeight: 'bold', marginTop: 24, marginBottom: 10 },
  emptyText: { color: '#64748B', marginTop: 10 },
  policyCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 11 },
  policyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  policyName: { color: '#172554', fontSize: 17, fontWeight: 'bold', flex: 1 },
  defaultBadge: { color: '#047857', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: 'bold' },
  policyDetails: { color: '#64748B', marginTop: 7 },
  editButton: { backgroundColor: '#E2E8F0', borderRadius: 9, padding: 11, alignItems: 'center', marginTop: 13 },
  editButtonText: { color: '#172554', fontWeight: '600' },
});
