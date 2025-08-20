// Database types
export interface Note {
  id: number;
  day: string;
  text: string;
  created_at: string;
  updated_at: string;
}

// Component prop types
export interface HorizontalDayViewerProps {
  onDateSelect: (dateString: string) => void;
  selectedDate: string;
  editedDates?: string[];
}

export interface RichTextEditorProps {
  selectedDate: string;
  onContentSaved?: () => void;
  isDatabaseReady: boolean;
}


// Calendar types
export interface DayItem {
  date: Date;
  dateString: string;
  index: number;
}

// Theme types
export interface ThemeColors {
  background: string;
  text: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  calendarBackground: string;
  calendarBorder: string;
  calendarToday: string;
  calendarSelected: string;
  calendarText: string;
}

// Error types
export interface DatabaseError extends Error {
  code?: string;
  sqliteCode?: number;
}

// State types
export interface AppState {
  selectedDate: string;
  editedDates: string[];
  isDatabaseReady: boolean;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  currentNoteContent: string;
}

export interface ChatFABProps {
  onPress: () => void;
}

// Utility types
export type DateString = string; // Format: YYYY-MM-DD
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';