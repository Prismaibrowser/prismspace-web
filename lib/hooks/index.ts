// lib/hooks/index.ts
// Centralized export for all Dexie database hooks

export { useChecklists } from './useChecklist';
export { useFocusTimer } from './useFocusTimer';
export { useBookmarks } from './useBookmarks';
export { useHabits } from './useHabits';
export { useRandomPickerHistory } from './useRandomPickerHistory';
export { useShortcuts } from './useShortcuts';

export {
  useAiToolHistory,
  useWritingAssistantHistory,
  useLanguageLearningHistory,
  useCodeExplainerHistory,
  useCodeTranslatorHistory,
  useDecisionAnalyzerHistory
} from './useAiToolHistory';

// Re-export types for convenience
export type {
  Checklist,
  ChecklistItem,
  FocusSession,
  FocusSettings,
  Bookmark,
  Habit,
  HabitLog,
  RandomPickerHistory,
  RandomPickerSettings,
  Shortcut,
  AiToolHistory,
  LanguageLearningStats,
  AppSettings
} from '../db';

export type {
  PickerMode,
  NamePickerInputs,
  NumberGeneratorInputs,
  DiceRollerInputs,
  ListRandomizerInputs
} from './useRandomPickerHistory';

export type { AiToolType } from './useAiToolHistory';
