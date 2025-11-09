import { Stack } from 'expo-router';
import { Plus, Edit, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSeating } from '@/contexts/SeatingContext';
import { TAG_COLORS, TAG_LABELS, ALL_TAGS } from '@/constants/tags';
import { StudentTag } from '@/types/seating';

export default function StudentsScreen() {
  const { students, addStudent, updateStudent, deleteStudent } = useSeating();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<StudentTag[]>([]);
  const [notes, setNotes] = useState('');
  const [points, setPoints] = useState(0);

  const handleOpenModal = (studentId?: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setEditingId(studentId);
        setName(student.name);
        setSelectedTags(student.tags);
        setNotes(student.notes);
        setPoints(student.points);
      }
    } else {
      setEditingId(null);
      setName('');
      setSelectedTags([]);
      setNotes('');
      setPoints(0);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setName('');
    setSelectedTags([]);
    setNotes('');
    setPoints(0);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (editingId) {
      updateStudent(editingId, name.trim(), selectedTags, notes, points);
    } else {
      addStudent(name.trim(), selectedTags, notes, points);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    deleteStudent(id);
  };

  const toggleTag = (tag: StudentTag) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Students',
          headerStyle: {
            backgroundColor: '#1A1A2E',
          },
          headerTintColor: '#fff',
        }} 
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Student Roster</Text>
          <Text style={styles.subtitle}>{students.length} students</Text>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Student</Text>
        </TouchableOpacity>

        <View style={styles.studentsList}>
          {students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.studentHeader}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  {student.points > 0 && (
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>{student.points} pts</Text>
                    </View>
                  )}
                </View>
                {student.notes && (
                  <Text style={styles.notesPreview} numberOfLines={1}>
                    {student.notes}
                  </Text>
                )}
                <View style={styles.tagsContainer}>
                  {student.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tagBadge, { backgroundColor: TAG_COLORS[tag] }]}
                    >
                      <Text style={styles.tagText}>{TAG_LABELS[tag]}</Text>
                    </View>
                  ))}
                  {student.tags.length === 0 && (
                    <Text style={styles.noTagsText}>No tags</Text>
                  )}
                </View>
              </View>
              <View style={styles.studentActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleOpenModal(student.id)}
                >
                  <Edit size={20} color="#4ECDC4" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(student.id)}
                >
                  <Trash2 size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {students.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No students yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add students to create a seating chart
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Student' : 'Add Student'}
            </Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter student name"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this student"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Points</Text>
            <View style={styles.pointsContainer}>
              <TouchableOpacity
                style={styles.pointButton}
                onPress={() => setPoints(Math.max(0, points - 1))}
              >
                <Text style={styles.pointButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.pointsValue}>{points}</Text>
              <TouchableOpacity
                style={styles.pointButton}
                onPress={() => setPoints(points + 1)}
              >
                <Text style={styles.pointButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsGrid}>
              {ALL_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagOption,
                    selectedTags.includes(tag) && styles.tagOptionSelected,
                    { borderColor: TAG_COLORS[tag] },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <View
                    style={[
                      styles.tagOptionColor,
                      { backgroundColor: TAG_COLORS[tag] },
                    ]}
                  />
                  <Text style={styles.tagOptionText}>{TAG_LABELS[tag]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveButtonText}>
                {editingId ? 'Save Changes' : 'Add Student'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  pointsBadge: {
    backgroundColor: '#FFE66D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#000',
  },
  notesPreview: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  noTagsText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic' as const,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#4A4A5E',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  pointButton: {
    backgroundColor: '#4ECDC4',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointButtonText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    minWidth: 60,
    textAlign: 'center',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A2E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  tagOptionSelected: {
    backgroundColor: '#2A2A3E',
  },
  tagOptionColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tagOptionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#fff',
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
