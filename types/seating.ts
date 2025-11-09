export type StudentTag = 'chatty' | 'leader' | 'quiet' | 'needsHelp' | 'focusedWorker';

export interface Student {
  id: string;
  name: string;
  tags: StudentTag[];
  notes: string;
  points: number;
}

export interface SeatPosition {
  row: number;
  col: number;
}

export interface SeatingAssignment {
  studentId: string | null;
  position: SeatPosition;
}

export interface GridConfig {
  rows: number;
  cols: number;
}

export interface TableGroup {
  seats: SeatPosition[];
}
