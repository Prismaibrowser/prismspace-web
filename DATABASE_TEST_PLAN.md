# PrismDB Test Plan

Comprehensive testing strategy for the PrismSpace database layer.

## Test Levels

### 1. Unit Tests (Hooks)
### 2. Integration Tests (Cross-Component)
### 3. Migration Tests (localStorage → Dexie)
### 4. Performance Tests (Large datasets)
### 5. User Acceptance Tests (Real workflows)

---

## 1. Unit Tests - Hooks

### useChecklists Hook

```typescript
describe('useChecklists', () => {
  beforeEach(async () => {
    await db.checklists.clear();
    await db.checklist_items.clear();
  });

  test('creates checklist with items', async () => {
    const { createChecklist } = renderHook(() => useChecklists());
    const id = await createChecklist('Test List', ['Item 1', 'Item 2']);
    
    const list = await db.checklists.get(id);
    expect(list.name).toBe('Test List');
    
    const items = await db.checklist_items.where('checklistId').equals(id).toArray();
    expect(items).toHaveLength(2);
  });

  test('toggles item completion', async () => {
    const id = await db.checklists.add({ name: 'Test', createdAt: Date.now(), updatedAt: Date.now() });
    const itemId = await db.checklist_items.add({ 
      checklistId: id, 
      text: 'Test', 
      completed: false, 
      order: 0, 
      createdAt: Date.now() 
    });
    
    const { toggleItemCompleted } = renderHook(() => useChecklists());
    await toggleItemCompleted(itemId);
    
    const item = await db.checklist_items.get(itemId);
    expect(item.completed).toBe(true);
  });

  test('calculates progress correctly', async () => {
    const items = [
      { completed: true },
      { completed: true },
      { completed: false }
    ];
    
    const { getChecklistProgress } = renderHook(() => useChecklists());
    const progress = getChecklistProgress(items);
    
    expect(progress.total).toBe(3);
    expect(progress.completed).toBe(2);
    expect(progress.percentage).toBeCloseTo(66.67);
  });
});
```

### useBookmarks Hook

```typescript
describe('useBookmarks', () => {
  test('prevents duplicate URLs', async () => {
    const { addBookmark } = renderHook(() => useBookmarks());
    
    await addBookmark({ url: 'https://example.com' });
    
    await expect(
      addBookmark({ url: 'https://example.com' })
    ).rejects.toThrow('Bookmark already exists');
  });

  test('normalizes URLs', async () => {
    const { addBookmark } = renderHook(() => useBookmarks());
    
    const id = await addBookmark({ url: 'example.com' });
    const bookmark = await db.bookmarks.get(id);
    
    expect(bookmark.url).toBe('https://example.com');
  });

  test('tracks visit count', async () => {
    const id = await db.bookmarks.add({
      url: 'https://test.com',
      title: 'Test',
      tags: [],
      notes: '',
      createdAt: Date.now(),
      visitCount: 0,
      lastVisitedAt: null
    });
    
    const { visitBookmark } = renderHook(() => useBookmarks());
    await visitBookmark(id);
    await visitBookmark(id);
    
    const bookmark = await db.bookmarks.get(id);
    expect(bookmark.visitCount).toBe(2);
    expect(bookmark.lastVisitedAt).not.toBeNull();
  });

  test('searches across title, url, notes, tags', async () => {
    await db.bookmarks.bulkAdd([
      { url: 'a.com', title: 'Apple', tags: [], notes: '', ... },
      { url: 'b.com', title: 'Banana', tags: ['fruit'], notes: '', ... },
      { url: 'c.com', title: 'Carrot', tags: [], notes: 'Vegetable', ... }
    ]);
    
    const { bookmarks, searchBookmarks } = renderHook(() => useBookmarks());
    
    const results = searchBookmarks('fruit', bookmarks);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Banana');
  });
});
```

### useFocusTimer Hook

```typescript
describe('useFocusTimer', () => {
  test('initializes with default settings', async () => {
    const { settings } = renderHook(() => useFocusTimer());
    
    expect(settings.focusMinutes).toBe(25);
    expect(settings.shortBreakMinutes).toBe(5);
    expect(settings.running).toBe(false);
  });

  test('tick reduces timeLeft by 1', async () => {
    await db.focus_settings.put({
      key: 'current',
      timeLeft: 100,
      running: true,
      ...DEFAULT_SETTINGS
    });
    
    const { tick } = renderHook(() => useFocusTimer());
    await tick();
    
    const settings = await db.focus_settings.get('current');
    expect(settings.timeLeft).toBe(99);
  });

  test('completes session when timeLeft = 0', async () => {
    await db.focus_settings.put({
      key: 'current',
      timeLeft: 0,
      currentPhase: 'focus',
      running: true,
      ...DEFAULT_SETTINGS
    });
    
    const { completeSession } = renderHook(() => useFocusTimer());
    await completeSession();
    
    const sessions = await db.focus_sessions.toArray();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].completed).toBe(true);
  });

  test('resets daily stats on new day', async () => {
    await db.focus_settings.put({
      key: 'current',
      todayDate: '2024-01-01',
      todaySessions: 5,
      todayFocusSeconds: 3000,
      ...DEFAULT_SETTINGS
    });
    
    const { settings } = renderHook(() => useFocusTimer());
    // Trigger check (automatically runs in useLiveQuery)
    
    expect(settings.todayDate).toBe(new Date().toISOString().slice(0, 10));
    expect(settings.todaySessions).toBe(0);
    expect(settings.todayFocusSeconds).toBe(0);
  });
});
```

### useHabits Hook

```typescript
describe('useHabits', () => {
  test('calculates daily streak correctly', async () => {
    const habitId = await db.habits.add({
      name: 'Test',
      icon: 'test',
      color: '#000',
      targetType: 'daily',
      targetCount: 1,
      createdAt: Date.now()
    });
    
    // Log completions for last 5 days
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await db.habit_logs.add({
        habitId,
        date: date.toISOString().slice(0, 10),
        completions: 1
      });
    }
    
    const { calculateStreak } = renderHook(() => useHabits());
    const streak = await calculateStreak(habitId);
    
    expect(streak.current).toBe(5);
  });

  test('compound index prevents duplicate daily logs', async () => {
    const habitId = 1;
    const date = '2024-01-01';
    
    await db.habit_logs.add({ habitId, date, completions: 1 });
    
    // Should update existing, not create duplicate
    const existing = await db.habit_logs
      .where('[habitId+date]')
      .equals([habitId, date])
      .first();
    
    if (existing) {
      await db.habit_logs.update(existing.id, { completions: 2 });
    }
    
    const count = await db.habit_logs
      .where('[habitId+date]')
      .equals([habitId, date])
      .count();
    
    expect(count).toBe(1);
  });

  test('calculates completion rate', async () => {
    const habitId = await db.habits.add({
      name: 'Test',
      targetType: 'daily',
      targetCount: 1,
      ...
    });
    
    // Complete 7 out of last 10 days
    for (let i = 0; i < 10; i++) {
      if (i < 7) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        await db.habit_logs.add({
          habitId,
          date: date.toISOString().slice(0, 10),
          completions: 1
        });
      }
    }
    
    const { getCompletionRate } = renderHook(() => useHabits());
    const rate = await getCompletionRate(habitId, 10);
    
    expect(rate).toBe(70);
  });
});
```

---

## 2. Integration Tests

### Cross-Tab Reactivity

```typescript
test('updates propagate across tabs', async () => {
  // Simulate two browser tabs
  const tab1 = renderHook(() => useBookmarks());
  const tab2 = renderHook(() => useBookmarks());
  
  // Tab 1 adds bookmark
  await tab1.addBookmark({ url: 'https://test.com' });
  
  // Wait for subscription update
  await waitFor(() => {
    expect(tab2.bookmarks).toHaveLength(1);
  });
  
  expect(tab2.bookmarks[0].url).toBe('https://test.com');
});
```

### Cascade Deletes

```typescript
test('deleting checklist removes all items', async () => {
  const { createChecklist, deleteChecklist } = renderHook(() => useChecklists());
  
  const id = await createChecklist('Test', ['Item 1', 'Item 2']);
  await deleteChecklist(id);
  
  const items = await db.checklist_items.where('checklistId').equals(id).toArray();
  expect(items).toHaveLength(0);
});

test('deleting habit removes all logs', async () => {
  const { addHabit, deleteHabit, logCompletion } = renderHook(() => useHabits());
  
  const habitId = await addHabit({ name: 'Test', ... });
  await logCompletion(habitId);
  await logCompletion(habitId);
  
  await deleteHabit(habitId);
  
  const logs = await db.habit_logs.where('habitId').equals(habitId).toArray();
  expect(logs).toHaveLength(0);
});
```

### Transaction Atomicity

```typescript
test('transaction rolls back on error', async () => {
  const initialCount = await db.checklists.count();
  
  try {
    await db.transaction('rw', db.checklists, db.checklist_items, async () => {
      await db.checklists.add({ name: 'Test', ... });
      throw new Error('Simulated error');
      await db.checklist_items.add({ ... }); // Should not execute
    });
  } catch (e) {
    // Expected
  }
  
  const finalCount = await db.checklists.count();
  expect(finalCount).toBe(initialCount); // Rolled back
});
```

---

## 3. Migration Tests

### localStorage to Dexie

```typescript
describe('Migration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.removeItem('prism_db_migration_done');
  });

  test('migrates checklists correctly', async () => {
    const legacy = {
      checklists: [
        {
          id: 'abc123',
          name: 'Test List',
          createdAt: 1234567890,
          items: [
            { id: 'item1', text: 'Item 1', checked: false },
            { id: 'item2', text: 'Item 2', checked: true }
          ]
        }
      ]
    };
    
    localStorage.setItem('prism.checklists.v1', JSON.stringify(legacy));
    
    await migrateFromLocalStorage();
    
    const lists = await db.checklists.toArray();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe('Test List');
    
    const items = await db.checklist_items.where('checklistId').equals(lists[0].id).toArray();
    expect(items).toHaveLength(2);
  });

  test('migrates habits with history', async () => {
    const legacy = [
      {
        id: 'habit1',
        name: 'Exercise',
        icon: 'dumbbell',
        color: '#22c55e',
        targetType: 'daily',
        targetCount: 1,
        history: {
          '2024-01-01': 1,
          '2024-01-02': 2,
          '2024-01-03': 1
        }
      }
    ];
    
    localStorage.setItem('prism.habits.v1', JSON.stringify(legacy));
    
    await migrateFromLocalStorage();
    
    const habits = await db.habits.toArray();
    expect(habits).toHaveLength(1);
    
    const logs = await db.habit_logs.where('habitId').equals(habits[0].id).toArray();
    expect(logs).toHaveLength(3);
    expect(logs.find(l => l.date === '2024-01-02').completions).toBe(2);
  });

  test('sets migration flag', async () => {
    localStorage.setItem('prism.bookmarks.v1', '[]');
    
    await migrateFromLocalStorage();
    
    expect(localStorage.getItem('prism_db_migration_done')).toBe('true');
  });

  test('skips migration if already done', async () => {
    localStorage.setItem('prism_db_migration_done', 'true');
    localStorage.setItem('prism.bookmarks.v1', '[{"url": "test.com"}]');
    
    await migrateFromLocalStorage();
    
    const bookmarks = await db.bookmarks.toArray();
    expect(bookmarks).toHaveLength(0); // Not migrated
  });
});
```

---

## 4. Performance Tests

### Large Dataset Queries

```typescript
describe('Performance', () => {
  test('handles 10,000 bookmarks efficiently', async () => {
    const bookmarks = Array.from({ length: 10000 }, (_, i) => ({
      url: `https://example.com/${i}`,
      title: `Bookmark ${i}`,
      tags: i % 3 === 0 ? ['work'] : [],
      notes: '',
      createdAt: Date.now(),
      visitCount: 0,
      lastVisitedAt: null
    }));
    
    await db.bookmarks.bulkAdd(bookmarks);
    
    const start = performance.now();
    const results = await db.bookmarks.where('tags').equals('work').toArray();
    const end = performance.now();
    
    expect(results.length).toBeGreaterThan(3000);
    expect(end - start).toBeLessThan(100); // < 100ms
  });

  test('compound index lookup is fast', async () => {
    const habitId = 1;
    
    // Insert 1000 days of logs
    const logs = Array.from({ length: 1000 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        habitId,
        date: date.toISOString().slice(0, 10),
        completions: Math.floor(Math.random() * 3)
      };
    });
    
    await db.habit_logs.bulkAdd(logs);
    
    const start = performance.now();
    const log = await db.habit_logs
      .where('[habitId+date]')
      .equals([habitId, '2024-01-01'])
      .first();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(10); // < 10ms
  });

  test('history auto-limit prevents unbounded growth', async () => {
    for (let i = 0; i < 150; i++) {
      await db.random_picker_history.add({
        mode: 'Coin Flip',
        input: '',
        result: i % 2 === 0 ? 'Heads' : 'Tails',
        createdAt: Date.now() - (i * 1000)
      });
    }
    
    const count = await db.random_picker_history.count();
    expect(count).toBeLessThanOrEqual(30); // Should be limited to 30
  });
});
```

---

## 5. User Acceptance Tests

### Scenario 1: Checklist Workflow

```
Given: User is on checklist page
When: User creates "Grocery List"
Then: List appears in sidebar

When: User adds "Milk", "Eggs", "Bread"
Then: 3 items appear unchecked

When: User checks "Milk"
Then: Progress shows "1 of 3 done"

When: User drags "Bread" to top
Then: Order updates immediately

When: User refreshes page
Then: All data persists correctly
```

### Scenario 2: Habit Tracking

```
Given: User has habit "Exercise Daily"
When: User logs completion for today
Then: Current streak increases by 1

When: User views heatmap
Then: Today's cell shows as completed

When: User opens second tab
Then: Heatmap updates automatically

When: User exports backup
Then: Habit history is included in JSON
```

### Scenario 3: Bookmark Management

```
Given: User has 50 bookmarks
When: User searches "react"
Then: Only matching bookmarks show

When: User filters by tag "docs"
Then: Only tagged bookmarks show

When: User clicks bookmark
Then: Visit count increases

When: User adds duplicate URL
Then: Error message appears
```

### Scenario 4: Focus Timer

```
Given: Timer is at 25:00
When: User clicks Start
Then: Timer begins counting down

When: 1 second passes
Then: Timer shows 24:59
And: Today's focus seconds increases

When: Timer reaches 0:00
Then: Session completes automatically
And: Break timer starts
And: Session saved to database
```

### Scenario 5: Backup & Restore

```
Given: User has data in all tables
When: User clicks "Export All Data"
Then: JSON file downloads

When: User clears all data
Then: Database is empty

When: User imports backup file
Then: Validation passes
And: Confirmation dialog appears

When: User confirms import
Then: All data restored
And: UI updates correctly
```

---

## Manual Testing Checklist

### Cross-Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Functionality Testing

- [ ] Create, read, update, delete operations
- [ ] Search and filter functions
- [ ] Sorting and ordering
- [ ] Pagination and limits
- [ ] Export and import
- [ ] Migration from localStorage

### Edge Cases

- [ ] Empty states
- [ ] Very long text inputs
- [ ] Special characters in text
- [ ] Large file imports
- [ ] Corrupted backup files
- [ ] Network offline mode
- [ ] Multiple rapid operations

### Performance

- [ ] Large datasets (10,000+ records)
- [ ] Complex queries with joins
- [ ] Bulk operations
- [ ] Cross-tab synchronization lag

### Security

- [ ] SQL injection attempts (n/a for IndexedDB)
- [ ] XSS in user-generated content
- [ ] CSRF protection (client-side only)
- [ ] Same-origin policy enforcement

---

## Continuous Integration Tests

```yaml
# .github/workflows/test.yml
name: Database Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:db
      - run: npm run test:integration
      - run: npm run test:migration
```

---

## Test Coverage Goals

| Category | Target Coverage | Notes |
|----------|----------------|-------|
| Hook Functions | 90%+ | Critical business logic |
| Migration Code | 100% | Zero data loss required |
| Export/Import | 95%+ | Backup reliability essential |
| UI Components | 70%+ | Focus on interactions |

---

## Reporting

### Test Output Format

```
PrismDB Test Suite
==================

Unit Tests:               ✅ 42/42 passed
Integration Tests:        ✅ 15/15 passed
Migration Tests:          ✅ 8/8 passed
Performance Tests:        ✅ 5/5 passed

Total:                    ✅ 70/70 passed
Coverage:                 92.5%
Duration:                 12.3s

Failed Tests:             0
Skipped Tests:            0
```

### Bug Report Template

```markdown
## Bug Report

**Hook/Component**: useBookmarks
**Test Case**: Duplicate URL prevention
**Expected**: Rejection with "Bookmark already exists"
**Actual**: Duplicate created with different ID
**Steps to Reproduce**:
1. Add bookmark with URL "https://example.com"
2. Add bookmark with same URL
3. Check database

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Dexie: 4.4.4

**Stack Trace**:
```
Error: Expected promise to reject but it resolved
    at useBookmarks.test.ts:45
```
```

---

**Test Plan Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Ready for Execution
