import { StudentTag } from '@/types/seating';

export const TAG_COLORS: Record<StudentTag, string> = {
  chatty: '#FF6B6B',
  leader: '#4ECDC4',
  quiet: '#95E1D3',
  needsHelp: '#FFE66D',
  focusedWorker: '#A78BFA',
};

export const TAG_LABELS: Record<StudentTag, string> = {
  chatty: 'Chatty',
  leader: 'Leader',
  quiet: 'Quiet',
  needsHelp: 'Needs Help',
  focusedWorker: 'Focused Worker',
};

export const ALL_TAGS: StudentTag[] = [
  'leader',
  'chatty',
  'quiet',
  'needsHelp',
  'focusedWorker',
];
