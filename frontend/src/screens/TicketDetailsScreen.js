import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  addTicketComment,
  clearSession,
  getCurrentUser,
  getAdminUsers,
  getTicketDetails,
  getTicketHistory,
  isAdminUser,
  assignTicket,
  resolveTicket,
  updateTicketPriority,
  updateTicketStatus,
} from '../services/api';

const STATUSES = [
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Closed', value: 'closed' },
];

const PRIORITIES = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export default function TicketDetailsScreen({ route, navigation }) {
  const [ticket, setTicket] = useState(route.params?.ticket || null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [impactDraft, setImpactDraft] = useState('2');
  const [urgencyDraft, setUrgencyDraft] = useState('2');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAdminChange, setSavingAdminChange] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const ticketId = ticket?._id || ticket?.id;

  useEffect(() => {
    const loadTicketDetails = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setIsAdmin(isAdminUser(user));

        const id = route.params?.ticket?._id || route.params?.ticket?.id;
        if (!id) {
          setLoadingComments(false);
          return;
        }

        const [details, users] = await Promise.all([
          getTicketDetails(id),
          isAdminUser(user) ? getAdminUsers() : Promise.resolve([]),
        ]);
        setTicket(details.ticket);
        setComments(details.comments);
        setHistory(details.history);
        setAssignees(users);
        setSelectedAssignee(details.ticket.assignee?._id || '');
        setSelectedPriority(String(details.ticket.priority || 'Medium').toLowerCase());
        setImpactDraft(String(details.ticket.impact ?? 2));
        setUrgencyDraft(String(details.ticket.urgency ?? 2));
      } catch (error) {
        if (error.message?.includes('Not authorized') || error.message?.includes('token')) {
          await clearSession();
          navigation.replace('Welcome');
          Alert.alert('Session expired', 'Please sign in again.');
        } else {
          Alert.alert('Unable to load ticket', error.message || 'Please try again later.');
        }
      } finally {
        setLoadingComments(false);
      }
    };

    loadTicketDetails();
  }, [navigation, route.params?.ticket?._id, route.params?.ticket?.id]);

  const refreshHistory = async () => {
    if (!ticketId) return;
    try {
      setHistory(await getTicketHistory(ticketId));
    } catch (error) {
      Alert.alert('Unable to load ticket history', error.message || 'Please try again later.');
    }
  };

  const changeStatus = async (status) => {
    if (!ticketId || savingStatus) return;

    try {
      setSavingStatus(true);
      const updatedTicket = await updateTicketStatus(ticketId, status);
      setTicket((current) => ({ ...current, ...updatedTicket }));
      await refreshHistory();
    } catch (error) {
      Alert.alert('Unable to update status', error.message || 'Please try again later.');
    } finally {
      setSavingStatus(false);
    }
  };

  const savePriority = async () => {
    try {
      setSavingAdminChange(true);
      const updatedTicket = await updateTicketPriority(ticketId, {
        adminPriority: selectedPriority,
        impact: impactDraft,
        urgency: urgencyDraft,
      });
      setTicket((current) => ({ ...current, ...updatedTicket }));
      await refreshHistory();
    } catch (error) {
      Alert.alert('Unable to update priority', error.message || 'Please try again later.');
    } finally {
      setSavingAdminChange(false);
    }
  };

  const saveAssignee = async () => {
    if (!selectedAssignee) return;
    try {
      setSavingAdminChange(true);
      const updatedTicket = await assignTicket(ticketId, selectedAssignee);
      setTicket((current) => ({ ...current, ...updatedTicket }));
      await refreshHistory();
    } catch (error) {
      Alert.alert('Unable to assign ticket', error.message || 'Please try again later.');
    } finally {
      setSavingAdminChange(false);
    }
  };

  const resolveCurrentTicket = async () => {
    try {
      setSavingAdminChange(true);
      const updatedTicket = await resolveTicket(ticketId, resolutionNotes.trim());
      setTicket((current) => ({ ...current, ...updatedTicket }));
      await refreshHistory();
    } catch (error) {
      Alert.alert('Unable to resolve ticket', error.message || 'Please try again later.');
    } finally {
      setSavingAdminChange(false);
    }
  };

  const submitComment = async () => {
    const message = commentDraft.trim();
    if (!message || !ticketId || postingComment) return;

    try {
      setPostingComment(true);
      const result = await addTicketComment(ticketId, message);
      if (result.comment) {
        setComments((current) => [
          ...current,
          { ...result.comment, author: currentUser },
        ]);
      }
      if (result.ticket) {
        setTicket((current) => ({ ...current, ...result.ticket }));
      }
      await refreshHistory();
      setCommentDraft('');
    } catch (error) {
      Alert.alert('Unable to add comment', error.message || 'Please try again later.');
    } finally {
      setPostingComment(false);
    }
  };

  if (!ticket) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Ticket unavailable</Text>
        <Text style={styles.note}>Return to the ticket list and select a ticket loaded from the server.</Text>
      </View>
    );
  }

  const canReopenByComment = !isAdmin && ['Resolved', 'Closed'].includes(ticket.status);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.id}>{ticket.id || ticket._id}</Text>
      <Text style={styles.heading}>{ticket.title}</Text>

      {!!ticket.duplicateOf && (
        <View style={styles.duplicateNotice}>
          <Text style={styles.duplicateTitle}>Linked duplicate</Text>
          <Text style={styles.duplicateText}>
            This issue is linked to {ticket.duplicateOf.title || `ticket ${ticket.duplicateOf._id || ticket.duplicateOf}`}.
            {' '}When the main ticket is resolved, its resolution is copied here.
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{ticket.status || 'Unknown'}</Text>

        {isAdmin && (
          <>
            <Text style={styles.label}>Change status</Text>
            <View style={styles.statusOptions}>
              {STATUSES.map((status) => {
                const selected = ticket.status === status.label;
                return (
                  <Pressable
                    key={status.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: savingStatus || selected }}
                    disabled={savingStatus || selected}
                    style={[styles.statusButton, selected && styles.selectedStatusButton]}
                    onPress={() => changeStatus(status.value)}
                  >
                    <Text style={[styles.statusButtonText, selected && styles.selectedStatusText]}>
                      {status.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {savingStatus && <Text style={styles.note}>Saving status…</Text>}

            <Text style={styles.label}>Assign to</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedAssignee} onValueChange={setSelectedAssignee}>
                <Picker.Item label="Select an employee" value="" />
                {assignees.map((employee) => (
                  <Picker.Item
                    key={employee._id}
                    label={`${employee.name} (${employee.role === 'admin' ? 'Admin' : 'User'})`}
                    value={employee._id}
                  />
                ))}
              </Picker>
            </View>
            <Pressable style={styles.secondaryButton} disabled={savingAdminChange || !selectedAssignee} onPress={saveAssignee}>
              <Text style={styles.secondaryButtonText}>{savingAdminChange ? 'Saving…' : 'Save Assignee'}</Text>
            </Pressable>

            <Text style={styles.label}>Admin priority</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedPriority} onValueChange={setSelectedPriority}>
                {PRIORITIES.map((priority) => (
                  <Picker.Item key={priority.value} label={priority.label} value={priority.value} />
                ))}
              </Picker>
            </View>
            <Text style={styles.label}>Impact</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={impactDraft} onValueChange={setImpactDraft}>
                <Picker.Item label="Low" value="1" />
                <Picker.Item label="Medium" value="2" />
                <Picker.Item label="High" value="3" />
                <Picker.Item label="Critical" value="4" />
              </Picker>
            </View>
            <Text style={styles.label}>Urgency</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={urgencyDraft} onValueChange={setUrgencyDraft}>
                <Picker.Item label="Low" value="1" />
                <Picker.Item label="Medium" value="2" />
                <Picker.Item label="High" value="3" />
                <Picker.Item label="Critical" value="4" />
              </Picker>
            </View>
            <Pressable style={styles.secondaryButton} disabled={savingAdminChange} onPress={savePriority}>
              <Text style={styles.secondaryButtonText}>{savingAdminChange ? 'Saving…' : 'Save Priority'}</Text>
            </Pressable>

            {!['Resolved', 'Closed'].includes(ticket.status) && (
              <>
                <Text style={styles.label}>Resolution notes</Text>
                <TextInput
                  style={styles.commentInput}
                  value={resolutionNotes}
                  onChangeText={setResolutionNotes}
                  placeholder="Describe how the issue was resolved…"
                  multiline
                  maxLength={2000}
                />
                <Pressable style={styles.resolveButton} disabled={savingAdminChange} onPress={resolveCurrentTicket}>
                  <Text style={styles.commentButtonText}>{savingAdminChange ? 'Saving…' : 'Resolve Ticket'}</Text>
                </Pressable>
              </>
            )}
          </>
        )}

        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{ticket.category || 'Not specified'}</Text>

        <Text style={styles.label}>Priority</Text>
        <Text style={styles.value}>{ticket.priority || 'Not specified'}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{ticket.description || 'No description provided.'}</Text>

        {!!ticket.resolutionNotes && (
          <>
            <Text style={styles.label}>Resolution</Text>
            <Text style={styles.value}>{ticket.resolutionNotes}</Text>
          </>
        )}

        <Text style={styles.label}>Impact</Text>
        <Text style={styles.value}>{ticket.impact ?? 'Not specified'}</Text>

        <Text style={styles.label}>Urgency</Text>
        <Text style={styles.value}>{ticket.urgency ?? 'Not specified'}</Text>

        {!!ticket.responseDeadline && (
          <>
            <Text style={styles.label}>Response deadline</Text>
            <Text style={styles.value}>{new Date(ticket.responseDeadline).toLocaleString()}</Text>
          </>
        )}
        {!!ticket.slaDeadline && (
          <>
            <Text style={styles.label}>Resolution deadline</Text>
            <Text style={styles.value}>{new Date(ticket.slaDeadline).toLocaleString()}</Text>
          </>
        )}
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Ticket History</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyComments}>No history recorded.</Text>
        ) : history.map((entry, index) => (
          <View key={entry._id || `${entry.createdAt || 'history'}-${index}`} style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{entry.changedBy?.name || 'Account'} · {entry.field}</Text>
            <Text style={styles.commentMessage}>{entry.note || String(entry.newValue ?? '')}</Text>
            {!!entry.createdAt && <Text style={styles.commentDate}>{new Date(entry.createdAt).toLocaleString()}</Text>}
          </View>
        ))}
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <Text style={styles.note}>
          {canReopenByComment
            ? 'If the issue is still happening, comment here. Your follow-up will reopen this ticket for admin review.'
            : 'Add an update here to continue the conversation on this ticket.'}
        </Text>

        {loadingComments ? (
          <Text style={styles.emptyComments}>Loading comments…</Text>
        ) : comments.length === 0 ? (
          <Text style={styles.emptyComments}>No comments yet.</Text>
        ) : comments.map((comment, index) => (
          <View key={comment._id || `${comment.createdAt || 'comment'}-${index}`} style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{comment.author?.name || 'Account'}</Text>
            <Text style={styles.commentMessage}>{comment.message}</Text>
            {!!comment.createdAt && (
              <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</Text>
            )}
          </View>
        ))}

        <TextInput
          style={styles.commentInput}
          placeholder="Describe the update or ongoing issue…"
          value={commentDraft}
          onChangeText={setCommentDraft}
          multiline
          maxLength={2000}
          textAlignVertical="top"
          editable={!postingComment}
        />
        <Pressable
          style={[styles.commentButton, (!commentDraft.trim() || postingComment) && styles.disabledButton]}
          disabled={!commentDraft.trim() || postingComment}
          onPress={submitComment}
        >
          <Text style={styles.commentButtonText}>{postingComment ? 'Adding comment…' : 'Add Comment'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 35 },
  emptyContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  emptyTitle: { color: '#172554', fontSize: 20, fontWeight: 'bold' },
  id: { color: '#64748B', fontSize: 14 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#172554', marginTop: 8 },
  duplicateNotice: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 10, padding: 14, marginTop: 14 },
  duplicateTitle: { color: '#1D4ED8', fontWeight: 'bold', marginBottom: 5 },
  duplicateText: { color: '#1E3A8A', lineHeight: 21 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginTop: 20 },
  label: { color: '#64748B', marginTop: 15, marginBottom: 5 },
  value: { color: '#172554', fontSize: 16, lineHeight: 23 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9, overflow: 'hidden' },
  statusButton: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 12 },
  selectedStatusButton: { borderColor: '#2563EB', backgroundColor: '#DBEAFE' },
  statusButtonText: { color: '#334155', fontWeight: '600' },
  selectedStatusText: { color: '#1D4ED8' },
  commentsSection: { marginTop: 24 },
  secondaryButton: { backgroundColor: '#E2E8F0', borderRadius: 9, padding: 12, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#172554', fontWeight: 'bold' },
  resolveButton: { backgroundColor: '#059669', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  sectionTitle: { color: '#172554', fontSize: 20, fontWeight: 'bold' },
  note: { color: '#64748B', marginTop: 12, lineHeight: 21 },
  emptyComments: { color: '#64748B', marginTop: 18, marginBottom: 8 },
  commentCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginTop: 10 },
  commentAuthor: { color: '#172554', fontWeight: 'bold' },
  commentMessage: { color: '#334155', marginTop: 7, lineHeight: 21 },
  commentDate: { color: '#94A3B8', fontSize: 12, marginTop: 8 },
  commentInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, minHeight: 90, padding: 12, marginTop: 16, color: '#172554' },
  commentButton: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.55 },
  commentButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});
