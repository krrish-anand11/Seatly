import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSeating } from '@/contexts/SeatingContext';

export default function SettingsScreen() {
  const { gridConfig, updateGridConfig } = useSeating();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState(gridConfig.rows.toString());
  const [cols, setCols] = useState(gridConfig.cols.toString());

  const handleSave = () => {
    const newRows = parseInt(rows, 10);
    const newCols = parseInt(cols, 10);

    if (newRows >= 1 && newRows <= 20 && newCols >= 1 && newCols <= 20) {
      updateGridConfig(newRows, newCols);

    }
  };

  const isValid = () => {
    const newRows = parseInt(rows, 10);
    const newCols = parseInt(cols, 10);
    return newRows >= 1 && newRows <= 20 && newCols >= 1 && newCols <= 20;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: '#1A1A2E',
          },
          headerTintColor: '#fff',
        }} 
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grid Configuration</Text>
          <Text style={styles.sectionSubtitle}>
            Configure the classroom layout dimensions
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Rows</Text>
            <TextInput
              style={styles.input}
              value={rows}
              onChangeText={setRows}
              keyboardType="number-pad"
              placeholder="4"
              placeholderTextColor="#666"
            />
            <Text style={styles.hint}>Maximum: 20 rows</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Columns</Text>
            <TextInput
              style={styles.input}
              value={cols}
              onChangeText={setCols}
              keyboardType="number-pad"
              placeholder="8"
              placeholderTextColor="#666"
            />
            <Text style={styles.hint}>Maximum: 20 columns</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !isValid() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isValid()}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Smart Seating helps teachers create optimal classroom layouts based on student
            characteristics. The algorithm ensures:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletText}>• One leader per table group</Text>
            <Text style={styles.bulletText}>• Chatty students are separated</Text>
            <Text style={styles.bulletText}>• Balanced distribution of all traits</Text>
          </View>
        </View>
      </ScrollView>
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
  section: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F0F1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  aboutText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
