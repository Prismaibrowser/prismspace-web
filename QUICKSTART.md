# PrismDB Quick Start Guide

Get up and running with the PrismSpace database layer in 5 minutes.

## Installation

Dependencies are already installed! ✅

```json
{
  "dexie": "^4.4.4",
  "dexie-export-import": "^4.4.0",
  "dexie-react-hooks": "^4.4.0"
}
```

## Basic Usage

### 1. Import the Hook

```tsx
'use client';  // ← REQUIRED for all components using hooks

import { useBookmarks } from '@/lib/hooks';

export function MyComponent() {
  const { bookmarks, addBookmark } = useBookmarks();
  
  return <div>{/* ... */}</div>;
}
```

### 2. Display Data

```tsx
'use client';

import { useBookmarks } from '@/lib/hooks';

export function BookmarkList() {
  const { bookmarks } = useBookmarks();

  return (
    <ul>
      {bookmarks?.map(bookmark => (
        <li key={bookmark.id}>
          <a href={bookmark.url}>{bookmark.title}</a>
        </li>
      ))}
    </ul>
  );
}
```

### 3. Add Data

```tsx
'use client';

import { useState } from 'react';
import { useBookmarks } from '@/lib/hooks';

export function AddBookmark() {
  const { addBookmark } = useBookmarks();
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBookmark({ url });
      setUrl('');
      alert('Added!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
      />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 4. Update/Delete Data

```tsx
'use client';

import { useBookmarks } from '@/lib/hooks';

export function BookmarkActions({ id }: { id: number }) {
  const { updateBookmark, deleteBookmark, visitBookmark } = useBookmarks();

  return (
    <div>
      <button onClick={() => visitBookmark(id)}>
        Visit (tracks count)
      </button>
      
      <button onClick={() => updateBookmark(id, { 
        tags: ['favorite'] 
      })}>
        Mark Favorite
      </button>
      
      <button onClick={() => deleteBookmark(id)}>
        Delete
      </button>
    </div>
  );
}
```

## Available Hooks

### Checklist Manager
```tsx
const {
  checklists,
  createChecklist,
  addItem,
  toggleItemCompleted
} = useChecklists();
```

### Focus Timer
```tsx
const {
  settings,
  startTimer,
  pauseTimer,
  tick
} = useFocusTimer();
```

### Bookmarks
```tsx
const {
  bookmarks,
  addBookmark,
  searchBookmarks,
  getAllTags
} = useBookmarks();
```

### Habits
```tsx
const {
  habits,
  logCompletion,
  calculateStreak
} = useHabits();
```

### Random Picker
```tsx
const {
  history,
  addHistory,
  getSavedInputs
} = useRandomPickerHistory();
```

### Shortcuts
```tsx
const {
  shortcuts,
  pinnedShortcuts,
  togglePin
} = useShortcuts();
```

### AI Tool History
```tsx
const {
  history,
  addEntry,
  getStats
} = useWritingAssistantHistory();
```

## Common Patterns

### Loading State

```tsx
const { bookmarks } = useBookmarks();

if (!bookmarks) {
  return <div>Loading...</div>;
}

return <div>{bookmarks.length} bookmarks</div>;
```

### Search/Filter

```tsx
const { bookmarks, searchBookmarks } = useBookmarks();
const [query, setQuery] = useState('');

const filtered = searchBookmarks(query, bookmarks);

return (
  <>
    <input value={query} onChange={(e) => setQuery(e.target.value)} />
    {filtered.map(/* ... */)}
  </>
);
```

### Conditional Queries

```tsx
const items = useLiveQuery(() => {
  if (!activeListId) return [];
  return db.checklist_items
    .where('checklistId')
    .equals(activeListId)
    .sortBy('order');
}, [activeListId]);
```

### Timer with useEffect

```tsx
const { settings, tick } = useFocusTimer();

useEffect(() => {
  if (!settings?.running) return;
  
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}, [settings?.running]);
```

## Backup & Restore

Add to your settings page:

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

## Debugging

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → **PrismDB**
4. Click any table to view data

### Console Commands

```js
// Import database
const { db } = await import('./lib/db');

// Count records
await db.bookmarks.count();

// View all
await db.bookmarks.toArray();

// Query
await db.bookmarks.where('tags').equals('work').toArray();

// Stats
const { getDatabaseStats } = await import('./lib/db-export');
await getDatabaseStats();
```

## Migration from localStorage

Automatic! Just use the hooks and old data will be migrated on first load.

To check migration status:
```js
localStorage.getItem('prism_db_migration_done');
```

To force re-migration:
```js
localStorage.removeItem('prism_db_migration_done');
location.reload();
```

## Common Gotchas

### ❌ Wrong: Missing 'use client'
```tsx
import { useBookmarks } from '@/lib/hooks';  // Error: Dexie needs browser

export function MyComponent() {
  const { bookmarks } = useBookmarks();
  // ...
}
```

### ✅ Right: With 'use client'
```tsx
'use client';  // ← Add this!

import { useBookmarks } from '@/lib/hooks';

export function MyComponent() {
  const { bookmarks } = useBookmarks();
  // ...
}
```

### ❌ Wrong: Direct database calls
```tsx
import { db } from '@/lib/db';

export function MyComponent() {
  const bookmarks = db.bookmarks.toArray();  // Not reactive!
  // ...
}
```

### ✅ Right: Use hooks
```tsx
import { useBookmarks } from '@/lib/hooks';

export function MyComponent() {
  const { bookmarks } = useBookmarks();  // Reactive! ✨
  // ...
}
```

### ❌ Wrong: Manual saves
```tsx
const { bookmarks } = useBookmarks();

const addOne = () => {
  bookmarks.push({ url: '...' });  // Doesn't save!
};
```

### ✅ Right: Use hook methods
```tsx
const { addBookmark } = useBookmarks();

const addOne = async () => {
  await addBookmark({ url: '...' });  // Saves automatically!
};
```

## Next Steps

- Read [DATABASE_README.md](./DATABASE_README.md) for full API reference
- Read [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) to convert existing components
- Read [DATABASE_IMPLEMENTATION_SUMMARY.md](./DATABASE_IMPLEMENTATION_SUMMARY.md) for architecture details

## Support

Questions? Check the docs above or search the codebase for usage examples.
