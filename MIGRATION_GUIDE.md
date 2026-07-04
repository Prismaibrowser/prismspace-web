# Migration Guide: Converting Components from localStorage to Dexie

This guide shows how to convert existing tool components from localStorage to the new Dexie database layer.

## General Migration Pattern

### Before (localStorage)
```tsx
'use client';
import { useState, useEffect } from 'react';

function MyComponent() {
  const [data, setData] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('my_key');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  const addItem = (item) => {
    const newData = [...data, item];
    setData(newData);
    localStorage.setItem('my_key', JSON.stringify(newData));
  };

  return <div>{/* ... */}</div>;
}
```

### After (Dexie)
```tsx
'use client';
import { useMyHook } from '@/lib/hooks/useMyHook';

function MyComponent() {
  const { data, addItem } = useMyHook();

  // Data automatically loaded and reactive
  // No manual save needed - happens in hook

  return <div>{/* ... */}</div>;
}
```

## Real Example: Checklist Manager

### Step 1: Remove localStorage code

**Before:**
```javascript
// HTML file with inline script
const STORAGE_KEY = "prism.checklists.v1";
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || { checklists: [] };
  } catch {
    return { checklists: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createChecklist(name) {
  state.checklists.push({ id: uid(), name, items: [] });
  saveState();
  render();
}
```

### Step 2: Create React component with hook

**After:**
```tsx
'use client';
import { useChecklists } from '@/lib/hooks/useChecklist';

export function ChecklistManager() {
  const {
    checklists,
    createChecklist,
    deleteChecklist,
    addItem,
    toggleItemCompleted,
    getChecklistProgress
  } = useChecklists();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  // Load items when active checklist changes
  useEffect(() => {
    if (activeId) {
      getChecklistWithItems(activeId).then(result => {
        setItems(result?.items || []);
      });
    }
  }, [activeId]);

  const handleCreate = async (name: string) => {
    const id = await createChecklist(name, []);
    setActiveId(id as number);
  };

  return (
    <div className="grid grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <aside>
        {checklists?.map(list => {
          const progress = getChecklistProgress(items);
          return (
            <button
              key={list.id}
              onClick={() => setActiveId(list.id!)}
              className={activeId === list.id ? 'active' : ''}
            >
              {list.name}
              <span>{progress.completed}/{progress.total}</span>
            </button>
          );
        })}
      </aside>

      {/* Items */}
      <main>
        {items.map(item => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItemCompleted(item.id!)}
            />
            <span>{item.text}</span>
          </div>
        ))}
      </main>
    </div>
  );
}
```

## Example: Focus Timer Migration

### Before (localStorage with manual updates)

```javascript
const STORAGE_KEY = "prism.focusTimer.v2";
let state = {
  focusMinutes: 25,
  running: false,
  timeLeft: 1500
};

function tick() {
  if (!state.running) return;
  state.timeLeft--;
  saveState();
  render();
}

setInterval(tick, 1000);
```

### After (Dexie with reactive updates)

```tsx
'use client';
import { useEffect } from 'react';
import { useFocusTimer } from '@/lib/hooks/useFocusTimer';

export function FocusTimer() {
  const {
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setTaskLabel
  } = useFocusTimer();

  // Tick every second when running
  useEffect(() => {
    if (!settings?.running) return;
    
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.running, tick]);

  if (!settings) return <div>Loading...</div>;

  const minutes = Math.floor(settings.timeLeft / 60);
  const seconds = settings.timeLeft % 60;

  return (
    <div>
      <h2>{settings.currentPhase}</h2>
      <div className="time">
        {minutes.toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </div>

      <input
        value={settings.taskLabel}
        onChange={(e) => setTaskLabel(e.target.value)}
        placeholder="What are you working on?"
      />

      <div className="controls">
        {settings.running ? (
          <button onClick={pauseTimer}>Pause</button>
        ) : (
          <button onClick={startTimer}>Start</button>
        )}
        <button onClick={() => resetTimer()}>Reset</button>
      </div>

      <div className="stats">
        <span>Today: {settings.todaySessions} sessions</span>
        <span>{Math.round(settings.todayFocusSeconds / 60)} minutes</span>
      </div>
    </div>
  );
}
```

## Example: Bookmarks with Search

### Before

```javascript
let bookmarks = JSON.parse(localStorage.getItem('prism.bookmarks.v1') || '[]');

function searchBookmarks(query) {
  return bookmarks.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase())
  );
}

function addBookmark(url, title, tags) {
  bookmarks.unshift({ id: uid(), url, title, tags, createdAt: Date.now() });
  localStorage.setItem('prism.bookmarks.v1', JSON.stringify(bookmarks));
  render();
}
```

### After

```tsx
'use client';
import { useState } from 'react';
import { useBookmarks } from '@/lib/hooks/useBookmarks';

export function BookmarkManager() {
  const {
    bookmarks,
    addBookmark,
    deleteBookmark,
    visitBookmark,
    searchBookmarks,
    filterByTag,
    getAllTags
  } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Reactive filtering
  const filtered = selectedTag
    ? filterByTag(selectedTag, bookmarks)
    : searchBookmarks(searchQuery, bookmarks);

  const handleAdd = async () => {
    try {
      await addBookmark({
        url: 'https://example.com',
        title: 'Example',
        tags: ['demo'],
        notes: 'Test bookmark'
      });
    } catch (error: any) {
      alert(error.message); // e.g., "Bookmark already exists"
    }
  };

  return (
    <div>
      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search bookmarks..."
      />

      {/* Tag filter */}
      <select
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
      >
        <option value="">All tags</option>
        {getAllTags(bookmarks).map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>

      {/* List */}
      <div className="bookmarks">
        {filtered?.map(bookmark => (
          <div key={bookmark.id} className="bookmark-card">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener"
              onClick={() => visitBookmark(bookmark.id!)}
            >
              {bookmark.title}
            </a>
            <div className="tags">
              {bookmark.tags.map(tag => (
                <span key={tag} onClick={() => setSelectedTag(tag)}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="meta">
              Visits: {bookmark.visitCount}
            </div>
            <button onClick={() => deleteBookmark(bookmark.id!)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Single Settings Object

**Before:**
```javascript
const settings = JSON.parse(localStorage.getItem('settings') || '{}');
```

**After:**
```tsx
const settings = useLiveQuery(() => 
  db.focus_settings.get('current')
);
```

### Pattern 2: Array of Items

**Before:**
```javascript
let items = JSON.parse(localStorage.getItem('items') || '[]');
```

**After:**
```tsx
const items = useLiveQuery(() => 
  db.checklist_items.where('checklistId').equals(activeId).toArray()
);
```

### Pattern 3: Filtered/Sorted Lists

**Before:**
```javascript
const filtered = items.filter(/* ... */).sort(/* ... */);
```

**After:**
```tsx
const filtered = useLiveQuery(() =>
  db.bookmarks
    .where('tags')
    .equals(selectedTag)
    .reverse()
    .sortBy('createdAt')
);
```

### Pattern 4: Batch Updates

**Before:**
```javascript
items.forEach(item => {
  item.checked = false;
});
localStorage.setItem('items', JSON.stringify(items));
```

**After:**
```tsx
await db.transaction('rw', db.checklist_items, async () => {
  await db.checklist_items
    .where('checklistId')
    .equals(listId)
    .modify({ completed: false });
});
```

## Migration Checklist

For each component:

- [ ] Identify all `localStorage.getItem()` calls
- [ ] Identify all `localStorage.setItem()` calls
- [ ] Identify data structure and relationships
- [ ] Choose or create appropriate hook
- [ ] Replace `useState` + `useEffect` with hook
- [ ] Remove manual save calls (hooks handle this)
- [ ] Test that data persists across refreshes
- [ ] Test that UI updates reactively
- [ ] Verify old localStorage data migrated

## Testing Migration

1. **Before migration:**
   ```bash
   # Export current localStorage to backup
   copy(Object.entries(localStorage))
   ```

2. **After migration:**
   ```bash
   # Verify data in Dexie
   await db.bookmarks.count()
   await db.bookmarks.toArray()
   ```

3. **Test reactivity:**
   - Open component in two browser tabs
   - Make change in tab 1
   - Verify tab 2 updates automatically

## Rollback Plan

If migration causes issues:

1. Stop using Dexie hooks temporarily
2. Revert to localStorage version
3. Data is still in IndexedDB (not lost)
4. Fix issues and re-migrate

The automatic migration preserves old localStorage keys, so original data remains accessible as fallback.
