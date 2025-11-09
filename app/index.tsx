import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Sparkles, Settings as SettingsIcon, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSeating } from '@/contexts/SeatingContext';
import { TAG_COLORS, TAG_LABELS } from '@/constants/tags';

export default function SeatingChartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    students,
    gridConfig,
    seatingMap,
    isLoading,
    generateSmartSeating,
    clearSeating,
  } = useSeating();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  const getStudentById = (id: string | null) => {
    if (!id) return null;
    return students.find(s => s.id === id);
  };

  const renderSeat = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const studentId = seatingMap.get(key);
    const student = getStudentById(studentId || null);

    return (
      <View key={key} style={styles.seatContainer}>
        {student ? (
          <View style={styles.occupiedSeat}>
            <View style={styles.seatHeader}>
              <Text style={styles.studentName} numberOfLines={1}>
                {student.name}
              </Text>
              {student.points > 0 && (
                <View style={styles.seatPointsBadge}>
                  <Text style={styles.seatPointsText}>{student.points}</Text>
                </View>
              )}
            </View>
            <View style={styles.tagsContainer}>
              {student.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tagBadge,
                    { backgroundColor: TAG_COLORS[tag] },
                  ]}
                >
                  <Text style={styles.tagText} numberOfLines={1}>
                    {TAG_LABELS[tag].substring(0, 3)}
                  </Text>
                </View>
              ))}
              {student.tags.length > 2 && (
                <View style={[styles.tagBadge, styles.moreTagsBadge]}>
                  <Text style={styles.tagText}>+{student.tags.length - 2}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptySeat}>
            <Text style={styles.emptySeatText}>Empty</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Seating Chart',
          headerStyle: {
            backgroundColor: '#1A1A2E',
          },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={styles.headerButton}
            >
              <SettingsIcon size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Classroom Layout</Text>
          <Text style={styles.subtitle}>
            {gridConfig.rows} rows × {gridConfig.cols} columns
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => router.push('/students')}
          >
            <Users size={20} color="#fff" />
            <Text style={styles.manageButtonText}>
              Manage Students ({students.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generateSmartSeating}
          >
            <Sparkles size={20} color="#fff" />
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearSeating}
          >
            <Trash2 size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === 'web'}
          contentContainerStyle={styles.gridScrollContent}
        >
          <View style={styles.gridContainer}>
            <Text style={styles.frontLabel}>📋 Front of Class</Text>
            {Array.from({ length: gridConfig.rows }).map((_, row) => (
              <View key={row} style={styles.row}>
                {Array.from({ length: gridConfig.cols }).map((_, col) => 
                  renderSeat(row, col)
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  manageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#A78BFA',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridScrollContent: {
    paddingRight: 16,
  },
  gridContainer: {
    alignItems: 'center',
  },
  frontLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  seatContainer: {
    marginHorizontal: 6,
  },
  emptySeat: {
    width: 80,
    height: 80,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A2A3E',
    borderStyle: 'dashed' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySeatText: {
    fontSize: 12,
    color: '#4A4A5E',
    fontWeight: '500' as const,
  },
  occupiedSeat: {
    width: 80,
    height: 80,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#2A2A3E',
  },
  seatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studentName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
  },
  seatPointsBadge: {
    backgroundColor: '#FFE66D',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 16,
    alignItems: 'center',
  },
  seatPointsText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  tagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: '#fff',
  },
  moreTagsBadge: {
    backgroundColor: '#4A4A5E',
  },
  headerButton: {
    padding: 4,
    marginRight: 8,
  },
});
