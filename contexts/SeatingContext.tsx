import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Student, GridConfig, SeatingAssignment, SeatPosition, StudentTag } from '@/types/seating';

const STORAGE_KEY_STUDENTS = 'seating_students';
const STORAGE_KEY_CONFIG = 'seating_config';
const STORAGE_KEY_ASSIGNMENTS = 'seating_assignments';

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getAdjacentSeats(position: SeatPosition, gridConfig: GridConfig): SeatPosition[] {
  const { row, col } = position;
  const { rows, cols } = gridConfig;
  const adjacent: SeatPosition[] = [];

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      adjacent.push({ row: newRow, col: newCol });
    }
  }

  return adjacent;
}

function getTableGroup(position: SeatPosition, gridConfig: GridConfig): SeatPosition[] {
  const tableRow = Math.floor(position.row / 2);
  const tableCol = Math.floor(position.col / 2) * 2;
  
  const group: SeatPosition[] = [];
  for (let r = tableRow * 2; r < Math.min((tableRow + 1) * 2, gridConfig.rows); r++) {
    for (let c = tableCol; c < Math.min(tableCol + 2, gridConfig.cols); c++) {
      group.push({ row: r, col: c });
    }
  }
  return group;
}

export const [SeatingProvider, useSeating] = createContextHook(() => {
  const [students, setStudents] = useState<Student[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfig>({ rows: 4, cols: 8 });
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, configData, assignmentsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_STUDENTS),
        AsyncStorage.getItem(STORAGE_KEY_CONFIG),
        AsyncStorage.getItem(STORAGE_KEY_ASSIGNMENTS),
      ]);

      if (studentsData) {
        const parsedStudents = JSON.parse(studentsData);
        const migratedStudents = parsedStudents.map((s: Student) => ({
          ...s,
          notes: s.notes || '',
          points: s.points || 0,
        }));
        setStudents(migratedStudents);
      }
      if (configData) setGridConfig(JSON.parse(configData));
      if (assignmentsData) setAssignments(JSON.parse(assignmentsData));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStudents = async (newStudents: Student[]) => {
    setStudents(newStudents);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(newStudents));
    } catch (error) {
      console.error('Failed to save students:', error);
    }
  };

  const saveConfig = async (newConfig: GridConfig) => {
    setGridConfig(newConfig);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const saveAssignments = async (newAssignments: SeatingAssignment[]) => {
    setAssignments(newAssignments);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(newAssignments));
    } catch (error) {
      console.error('Failed to save assignments:', error);
    }
  };

  const addStudent = useCallback((name: string, tags: StudentTag[], notes?: string, points?: number) => {
    const newStudent: Student = {
      id: generateRandomId(),
      name,
      tags,
      notes: notes || '',
      points: points || 0,
    };
    saveStudents([...students, newStudent]);
  }, [students]);

  const updateStudent = useCallback((id: string, name: string, tags: StudentTag[], notes?: string, points?: number) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          name, 
          tags,
          notes: notes !== undefined ? notes : s.notes,
          points: points !== undefined ? points : s.points,
        };
      }
      return s;
    });
    saveStudents(updated);
  }, [students]);

  const deleteStudent = useCallback((id: string) => {
    const filtered = students.filter(s => s.id !== id);
    saveStudents(filtered);
    
    const updatedAssignments = assignments.map(a => 
      a.studentId === id ? { ...a, studentId: null } : a
    );
    saveAssignments(updatedAssignments);
  }, [students, assignments]);

  const generateEmptySeating = useCallback((config?: GridConfig) => {
    const finalConfig = config || gridConfig;
    const emptyAssignments: SeatingAssignment[] = [];
    for (let row = 0; row < finalConfig.rows; row++) {
      for (let col = 0; col < finalConfig.cols; col++) {
        emptyAssignments.push({
          studentId: null,
          position: { row, col },
        });
      }
    }
    saveAssignments(emptyAssignments);
  }, [gridConfig]);

  const updateGridConfig = useCallback((rows: number, cols: number) => {
    const newConfig = { rows, cols };
    saveConfig(newConfig);
    generateEmptySeating(newConfig);
  }, [generateEmptySeating]);



  const generateSmartSeating = useCallback(() => {
    console.log('Generating smart seating...');
    
    if (students.length === 0) {
      console.log('No students to assign');
      generateEmptySeating();
      return;
    }

    const totalSeats = gridConfig.rows * gridConfig.cols;
    console.log(`Assigning ${students.length} students to ${totalSeats} seats`);
    
    const newAssignments: SeatingAssignment[] = [];
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.cols; col++) {
        newAssignments.push({
          studentId: null,
          position: { row, col },
        });
      }
    }
    
    const assignedStudentIds = new Set<string>();
    const chattyPositions = new Set<string>();
    
    const tableGroups: SeatPosition[][] = [];
    const processedSeats = new Set<string>();
    
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.cols; col++) {
        const key = `${row}-${col}`;
        if (!processedSeats.has(key)) {
          const group = getTableGroup({ row, col }, gridConfig);
          tableGroups.push(group);
          group.forEach(pos => processedSeats.add(`${pos.row}-${pos.col}`));
        }
      }
    }
    
    console.log(`Created ${tableGroups.length} table groups`);
    
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const studentsByPriority = {
      leaders: shuffledStudents.filter(s => s.tags.includes('leader')),
      chatty: shuffledStudents.filter(s => s.tags.includes('chatty') && !s.tags.includes('leader')),
      needsHelp: shuffledStudents.filter(s => s.tags.includes('needsHelp') && !s.tags.includes('leader') && !s.tags.includes('chatty')),
      others: shuffledStudents.filter(s => !s.tags.includes('leader') && !s.tags.includes('chatty') && !s.tags.includes('needsHelp')),
    };
    
    console.log('Student distribution:', {
      leaders: studentsByPriority.leaders.length,
      chatty: studentsByPriority.chatty.length,
      needsHelp: studentsByPriority.needsHelp.length,
      others: studentsByPriority.others.length,
      total: shuffledStudents.length,
    });
    
    tableGroups.forEach((group, tableIndex) => {
      if (studentsByPriority.leaders.length > 0) {
        const leader = studentsByPriority.leaders.shift();
        if (leader) {
          const availableSeats = group.filter(pos => {
            const assignment = newAssignments.find(
              a => a.position.row === pos.row && a.position.col === pos.col
            );
            return assignment && assignment.studentId === null;
          });
          
          if (availableSeats.length > 0) {
            const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
            const assignment = newAssignments.find(
              a => a.position.row === randomSeat.row && a.position.col === randomSeat.col
            );
            if (assignment) {
              assignment.studentId = leader.id;
              assignedStudentIds.add(leader.id);
              console.log(`Assigned leader ${leader.name} to table ${tableIndex}`);
            }
          }
        }
      }
    });
    
    const getAvailableSeats = () => newAssignments.filter(a => a.studentId === null);
    
    const priorityOrder = [
      ...studentsByPriority.chatty,
      ...studentsByPriority.needsHelp,
      ...studentsByPriority.others,
    ];
    
    const unassignedStudents = priorityOrder.filter(s => !assignedStudentIds.has(s.id));
    
    console.log(`Assigning ${unassignedStudents.length} remaining students`);
    
    for (const student of unassignedStudents) {
      const availableSeats = getAvailableSeats();
      
      if (availableSeats.length === 0) {
        console.warn(`No more seats available for ${student.name}`);
        break;
      }

      const isChatty = student.tags.includes('chatty');
      const isNeedsHelp = student.tags.includes('needsHelp');
      
      let bestSeat: SeatingAssignment | undefined;
      let bestScore = -Infinity;
      
      for (const seat of availableSeats) {
        let score = Math.random();
        const adjacent = getAdjacentSeats(seat.position, gridConfig);
        
        if (isChatty) {
          const hasChattyNeighbor = adjacent.some(adjPos => 
            chattyPositions.has(`${adjPos.row}-${adjPos.col}`)
          );
          if (hasChattyNeighbor) {
            score -= 1000;
          } else {
            score += 100;
          }
        }
        
        if (isNeedsHelp) {
          if (seat.position.row < gridConfig.rows / 2) {
            score += 50;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestSeat = seat;
        }
      }
      
      if (bestSeat) {
        bestSeat.studentId = student.id;
        assignedStudentIds.add(student.id);
        if (isChatty) {
          chattyPositions.add(`${bestSeat.position.row}-${bestSeat.position.col}`);
        }
        console.log(`Assigned ${student.name} to seat (${bestSeat.position.row}, ${bestSeat.position.col})`);
      } else {
        console.warn(`Could not find seat for ${student.name}`);
      }
    }
    
    const assignedCount = newAssignments.filter(a => a.studentId !== null).length;
    const missedStudents = students.filter(s => !assignedStudentIds.has(s.id));
    
    console.log(`Smart seating generated: ${assignedCount}/${students.length} students assigned`);
    if (missedStudents.length > 0) {
      console.warn('Missed students:', missedStudents.map(s => s.name).join(', '));
    }
    
    saveAssignments(newAssignments);
  }, [students, gridConfig, generateEmptySeating]);

  const assignStudentToSeat = useCallback((studentId: string | null, position: SeatPosition) => {
    const updated = assignments.map(a => {
      if (a.position.row === position.row && a.position.col === position.col) {
        return { ...a, studentId };
      }
      if (a.studentId === studentId) {
        return { ...a, studentId: null };
      }
      return a;
    });
    saveAssignments(updated);
  }, [assignments]);

  const clearSeating = useCallback(() => {
    generateEmptySeating();
  }, [generateEmptySeating]);

  const seatingMap = useMemo(() => {
    const map = new Map<string, string | null>();
    assignments.forEach(a => {
      const key = `${a.position.row}-${a.position.col}`;
      map.set(key, a.studentId);
    });
    return map;
  }, [assignments]);

  const unassignedStudents = useMemo(() => {
    const assignedIds = new Set(assignments.filter(a => a.studentId !== null).map(a => a.studentId));
    return students.filter(s => !assignedIds.has(s.id));
  }, [students, assignments]);

  return useMemo(() => ({
    students,
    gridConfig,
    assignments,
    isLoading,
    seatingMap,
    unassignedStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    updateGridConfig,
    generateSmartSeating,
    clearSeating,
    assignStudentToSeat,
  }), [
    students,
    gridConfig,
    assignments,
    isLoading,
    seatingMap,
    unassignedStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    updateGridConfig,
    generateSmartSeating,
    clearSeating,
    assignStudentToSeat,
  ]);
});
