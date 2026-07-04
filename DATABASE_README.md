# PrismSpace Database Layer - Dexie.js Implementation

This document describes the centralized Dexie.js database layer that replaces scattered localStorage and component state across PrismSpace.

## Overview

The database layer provides:
- **Centralized data storage** using IndexedDB via Dexie.js
- **Reactive hooks** using `dexie-react-hooks` for automatic UI updates
- **Type-safe** TypeScript interfaces for all tables
- **Full backup/restore** functionality using `dexie-export-import`
- **Automatic migration** from old localStorage data

## Architecture

```
lib/
├── db.ts                           # Core Dexie database definition
├── db-export.ts                    # Backup/restore utilities
└── hooks/
    ├── useChecklist.ts            # Checklist Manager hook
    ├── useFocusTimer.ts           # Focus Timer hook
    ├── useBookmarks.ts            # Bookmark Manager hook
    ├── useHabits.ts               # Habit Tracker hook
    ├── useRandomPickerHistory.ts  # Random Picker hook
    ├── useShortcuts.ts            # Shortcut Reference hook
    └── useAiToolHistory.ts        # AI Tools history hook
```

## Database Schema (Version 1)

### Tables

| Table | Purpose | Indexes |
|-------|---------|---------|
| `checklists` | Named checklists metadata | `++id, name, createdAt, updatedAt` |
| `checklist_items` | Individual checklist items | `++id, checklistId, [checklistId+order], completed, createdAt` |
| `focus_sessions` | Completed Pomodoro sessions | `++id, startedAt, completed` |
| `focus_settings` | Current timer state & settings | `&key` (single row) |
| `bookmarks` | Saved bookmarks | `++id, url, createdAt, lastVisitedAt, visitCount, *tags` |
| `habits` | Habit definitions | `++id, name, createdAt` |
| `habit_logs` | Daily habit check-ins | `++id, [habitId+date], habitId, date` |
| `random_picker_history` | Past random picks | `++id, mode, createdAt` |
| `random_picker_settings` | Saved inputs per mode | `&mode` |
| `shortcuts` | Keyboard shortcuts (built-in + custom) | `++id, appName, category, pinned, custom` |
| `ai_tool_history` | AI tool interaction logs | `++id, toolType, createdAt` |
| `language_learning_stats` | Language learning progress | `&key` |
| `settings` | App-wide key-value settings | `&key` |

### Key Features

- **Compound indexes** prevent duplicates (e.g., `[habitId+date]`)
- **Multi-entry indexes** enable tag search (e.g., `*tags` on bookmarks)
- **Auto-increment IDs** (`++id`) for all tables
- **Unique keys** (`&key`) for singleton settings tables

## Usage Examples

### Basic Hook Usage

```tsx
'use client';

import { useChecklists } from '@/lib/hooks/useChecklist';

export function ChecklistComponent() {
  const { checklists, createChecklist, deleteChecklist } = useChecklists();

  const handleCreate = async () => {
    await createChecklist('My List', ['Item 1', 'Item 2']);
  };

  return (
    <div>
      {checklists?.map(list => (
        <div key={list.id}>{list.name}</div>
      ))}
      <button onClick={handleCreate}>New Checklist</button>
    </div>
  );
}
```

### Bookmark Management

```tsx
'use client';

import { useBookmarks } from '@/lib/hooks/useBookmarks';

export function BookmarkList() {
  const { bookmarks, addBookmark, visitBookmark, getAllTags } = useBookmarks();

  const tags = getAllTags(bookmarks);

  return (
    <div>
      {bookmarks?.map(bookmark => (
        <div key={bookmark.id}>
          <a href={bookmark.url} onClick={() => visitBookmark(bookmark.id!)}>
            {bookmark.title}
          </a>
          <span>Visits: {bookmark.visitCount}</span>
        </div>
      ))}
    </div>
  );
}
```

### Focus Timer

```tsx
'use client';

import { useEffect } from 'react';
import { useFocusTimer } from '@/lib/hooks/useFocusTimer';

export function FocusTimer() {
  const { settings, startTimer, pauseTimer, tick } = useFocusTimer();

  useEffect(() => {
    if (!settings?.running) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [settings?.running]);

  return (
    <div>
      <div>{Math.floor((settings?.timeLeft || 0) / 60)}:{(settings?.timeLeft || 0) % 60}</div>
      <button onClick={startTimer}>Start</button>
      <button onClick={pauseTimer}>Pause</button>
    </div>
  );
}
```

### Habits with Streak Calculation

```tsx
'use client';

import { useHabits } from '@/lib/hooks/useHabits';
import { useEffect, useState } from 'react';

export function HabitTracker() {
  const { habits, logCompletion, calculateStreak } = useHabits();
  const [streaks, setStreaks] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    if (!habits) return;
    habits.forEach(async habit => {
      if (habit.id) {
        const streak = await calculateStreak(habit.id);
        setStreaks(prev => new Map(prev).set(habit.id!, streak));
      }
    });
  }, [habits]);

  return (
    <div>
      {habits?.map(habit => (
        <div key={habit.id}>
          <span>{habit.name}</span>
          <span>Current: {streaks.get(habit.id!)?.current || 0}</span>
          <button onClick={() => logCompletion(habit.id!)}>✓</button>
        </div>
      ))}
    </div>
  );
}
```

### AI Tool History

```tsx
'use client';

import { useWritingAssistantHistory } from '@/lib/hooks/useAiToolHistory';

export function WritingHistory() {
  const { history, addEntry, clearHistory } = useWritingAssistantHistory();

  const saveInteraction = async (input: string, output: string) => {
    await addEntry('writing', input, output, {
      action: 'improve',
      language: 'en'
    });
  };

  return (
    <div>
      <button onClick={() => clearHistory()}>Clear History</button>
      {history?.map(entry => (
        <div key={entry.id}>
          <p>Input: {entry.input.slice(0, 50)}...</p>
          <p>Output: {entry.output.slice(0, 50)}...</p>
        </div>
      ))}
    </div>
  );
}
```

## Backup & Restore

### Using the DataBackup Component

```tsx
import { DataBackup } from '@/components/DataBackup';

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <DataBackup />
    </div>
  );
}
```

### Programmatic Backup

```tsx
import { downloadBackup, importAllData } from '@/lib/db-export';

// Export
const result = await downloadBackup();
// Downloads: prism-backup-YYYY-MM-DD.json

// Import
const file = // ... from file input
const result = await importAllData(file, {
  clearTablesBeforeImport: true
});
```

## Migration from localStorage

Migration happens automatically on first load:

1. Checks if `prism_db_migration_done` flag exists
2. If not, reads all old localStorage keys
3. Migrates data to Dexie tables
4. Sets migration flag to prevent re-running

**Old localStorage keys migrated:**
- `prism.checklists.v1` → `checklists` + `checklist_items`
- `prism.focusTimer.v2` → `focus_sessions` + `focus_settings`
- `prism.bookmarks.v1` → `bookmarks`
- `prism.habits.v1` → `habits` + `habit_logs`
- `prism.randomPicker.v2` → `random_picker_history` + `random_picker_settings`
- `prism.shortcuts.pins.v1` → `shortcuts` (pinned flag)
- `ll_stats` → `language_learning_stats`

## Client-Side Only

**IMPORTANT:** All database code runs client-side only. Always include `'use client'` at the top of any component using these hooks.

```tsx
'use client';  // ← Required!

import { useBookmarks } from '@/lib/hooks/useBookmarks';
```

## Performance Considerations

### Automatic Reactivity

`useLiveQuery` automatically subscribes to database changes:
```tsx
// This component re-renders whenever bookmarks table changes
const bookmarks = useLiveQuery(() => db.bookmarks.toArray());
```

### Batch Operations

Use transactions for multiple related writes:
```tsx
await db.transaction('rw', db.checklists, db.checklist_items, async () => {
  const id = await db.checklists.add({ name: 'New List', ... });
  await db.checklist_items.bulkAdd([
    { checklistId: id, text: 'Item 1', ... },
    { checklistId: id, text: 'Item 2', ... }
  ]);
});
```

### Limit History Size

Hooks automatically limit history entries:
```tsx
// Keeps only last 30 entries
if (count > 30) {
  const oldest = await db.random_picker_history.orderBy('createdAt').first();
  await db.random_picker_history.delete(oldest.id);
}
```

## Debugging

### Chrome DevTools

Open IndexedDB inspector:
1. F12 → Application tab
2. IndexedDB → PrismDB
3. Explore tables

### Console Commands

```js
// Get database stats
await getDatabaseStats();

// Export to console
const blob = await exportDB(db);
const text = await blob.text();
console.log(JSON.parse(text));

// Clear specific table
await db.bookmarks.clear();
```

## Future Enhancements

Potential improvements for v2:

1. **Sync**: Cloud sync via WebSocket or REST API
2. **Full-text search**: Using Dexie's `anyOf()` or external library
3. **Encryption**: Encrypt sensitive data at rest
4. **Offline-first**: Service worker integration
5. **Conflict resolution**: For multi-device sync
6. **Schema versioning**: Migration scripts for v2, v3, etc.

## Troubleshooting

### Issue: "Database not found" error

**Solution:** Ensure component has `'use client'` directive and runs in browser.

### Issue: Data not updating in UI

**Solution:** Make sure you're using `useLiveQuery` from the hooks, not direct `db.table.get()`.

### Issue: Migration not running

**Solution:** Clear localStorage flag and refresh:
```js
localStorage.removeItem('prism_db_migration_done');
location.reload();
```

### Issue: Import fails with "Invalid format"

**Solution:** Only import files exported by PrismSpace. Check file starts with `{"databaseName":"PrismDB"...`.

## License

Same as PrismSpace project.
