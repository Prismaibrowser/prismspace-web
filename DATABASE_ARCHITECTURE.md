# PrismSpace Database Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Application                         │
│                      (Client Side Only)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    React Components                             │
│  'use client'                                                   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐       │
│  │ Checklist   │  │ Focus Timer  │  │ Bookmarks      │  ...  │
│  │ Manager     │  │              │  │                │       │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────┘       │
│         │                 │                   │                │
└─────────┼─────────────────┼───────────────────┼────────────────┘
          │                 │                   │
          │ useChecklists() │ useFocusTimer()   │ useBookmarks()
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Reactive Hooks Layer                        │
│                   lib/hooks/*.ts                                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │useChecklists │  │useFocusTimer │  │useBookmarks  │  ...   │
│  │              │  │              │  │              │        │
│  │ • CRUD       │  │ • Timer      │  │ • Search     │        │
│  │ • Reorder    │  │ • Stats      │  │ • Tags       │        │
│  │ • Progress   │  │ • Sessions   │  │ • Export     │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          │ useLiveQuery()   │                  │
          │ db.table.*       │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Dexie.js Database Layer                       │
│                      lib/db.ts                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PrismDatabase extends Dexie                             │  │
│  │                                                          │  │
│  │  Tables:                                                 │  │
│  │  • checklists              • bookmarks                   │  │
│  │  • checklist_items         • habits                      │  │
│  │  • focus_sessions          • habit_logs                  │  │
│  │  • focus_settings          • shortcuts                   │  │
│  │  • ai_tool_history         • settings                    │  │
│  │  • random_picker_*         • language_learning_stats     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ IndexedDB API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Browser IndexedDB                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Database: PrismDB (version 1)                         │    │
│  │                                                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │ checklists  │  │ bookmarks   │  │ habits      │   │    │
│  │  │             │  │             │  │             │   │    │
│  │  │ Indexes:    │  │ Indexes:    │  │ Indexes:    │   │    │
│  │  │ • id (PK)   │  │ • id (PK)   │  │ • id (PK)   │   │    │
│  │  │ • name      │  │ • url       │  │ • name      │   │    │
│  │  │ • createdAt │  │ • *tags     │  │ • createdAt │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                        │    │
│  │  ... 10 more tables with compound indexes ...         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Disk Storage: 50MB+ capacity                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Read Operation (Query)

```
Component
   │
   │ const { bookmarks } = useBookmarks();
   ▼
Hook (useBookmarks)
   │
   │ useLiveQuery(() => db.bookmarks.toArray())
   ▼
Dexie.js
   │
   │ Query optimization, index selection
   ▼
IndexedDB
   │
   │ Retrieve records from disk
   ▼
React Component
   │
   │ Automatic re-render on change ✨
   └─> UI updates
```

### Write Operation (Create/Update/Delete)

```
User Action (click button)
   │
   │ await addBookmark({ url: '...' })
   ▼
Hook Method (addBookmark)
   │
   │ 1. Validate data
   │ 2. Check duplicates
   │ 3. Transform data
   ▼
Dexie Transaction
   │
   │ await db.bookmarks.add({ ... })
   ▼
IndexedDB
   │
   │ Write to disk atomically
   ▼
Dexie Subscription System
   │
   │ Notify all useLiveQuery subscribers
   ▼
All Components with useBookmarks()
   │
   │ Automatic re-render with new data ✨
   └─> UI updates everywhere
```

## Reactive Updates (Cross-Tab)

```
┌──────────────┐         ┌──────────────┐
│   Tab 1      │         │   Tab 2      │
│              │         │              │
│ useBookmarks │         │ useBookmarks │
│      │       │         │      │       │
│      ▼       │         │      │       │
│  useLiveQuery│         │  useLiveQuery│
└──────┬───────┘         └──────┬───────┘
       │                        │
       │                        │
       └─────────┬──────────────┘
                 │
                 ▼
         ┌──────────────┐
         │  IndexedDB   │
         │              │
         │  Change      │
         │  detected    │
         └──────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   Tab 1      │   │   Tab 2      │
│   RE-RENDER  │   │   RE-RENDER  │
└──────────────┘   └──────────────┘
```

## Migration Flow

```
App Startup
   │
   │ if (typeof window !== 'undefined')
   ▼
Check Migration Flag
   │
   │ localStorage.getItem('prism_db_migration_done')
   ├─> Found: Skip migration
   │
   └─> Not found: Start migration
         │
         ▼
Read Old localStorage Keys
         │
         │ • prism.checklists.v1
         │ • prism.focusTimer.v2
         │ • prism.bookmarks.v1
         │ • prism.habits.v1
         │ • etc.
         ▼
Transform & Insert into Dexie
         │
         │ await db.checklists.bulkAdd(...)
         │ await db.bookmarks.bulkAdd(...)
         │ etc.
         ▼
Set Migration Flag
         │
         │ localStorage.setItem('prism_db_migration_done', 'true')
         └─> Complete! ✅
```

## Backup & Restore Flow

### Export

```
User clicks "Export All Data"
   │
   ▼
lib/db-export.ts
   │
   │ exportDB(db)
   ▼
Dexie Export Add-on
   │
   │ Serialize all tables to JSON
   │ Including schema and indexes
   ▼
Browser Download
   │
   │ prism-backup-YYYY-MM-DD.json
   └─> File saved to disk ✅
```

### Import

```
User selects backup file
   │
   ▼
lib/db-export.ts
   │
   │ validateBackupFile(file)
   ├─> Invalid: Show error
   │
   └─> Valid: Continue
         │
         ▼
Confirm Dialog
         │
         │ "This will replace all data. Continue?"
         ├─> No: Cancel
         │
         └─> Yes: Proceed
               │
               ▼
Delete & Recreate Database
               │
               │ await db.delete()
               │ await importDB(blob)
               ▼
               │
               └─> Data restored! ✅
                   User should refresh page
```

## Table Relationships

```
┌─────────────────┐
│   checklists    │
│                 │
│ • id (PK)       │
│ • name          │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ checklist_items │
│                 │
│ • id (PK)       │
│ • checklistId ─┐│ FK
│ • text         ││
│ • completed    ││
│ • order        ││
└────────────────┘│
                  └──┘


┌─────────────────┐
│     habits      │
│                 │
│ • id (PK)       │
│ • name          │
│ • targetType    │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  habit_logs     │
│                 │
│ • id (PK)       │
│ • habitId ─┐    │ FK
│ • date         ││ Compound Index: [habitId+date]
│ • completions  ││ Prevents duplicate daily logs
└────────────────┘│
                  └──┘
```

## Index Strategy

### Primary Keys (++)
```
++id → Auto-increment integer
  • Fast inserts
  • Guaranteed uniqueness
  • Used by: All main tables
```

### Unique Keys (&)
```
&key → Single value constraint
  • Enforces uniqueness
  • Used for settings tables
  • Example: focus_settings.key = 'current'
```

### Compound Indexes ([A+B])
```
[habitId+date] → Multi-column index
  • Prevents duplicate entries
  • Fast lookups by both columns
  • Example: Only one log per habit per day
```

### Multi-Entry Indexes (*)
```
*tags → Array index
  • Search within arrays
  • Each tag entry indexed separately
  • Example: Find bookmarks by tag
```

## Performance Characteristics

```
Operation         │ Time Complexity │ Notes
──────────────────┼─────────────────┼──────────────────────
Get by ID         │ O(log n)        │ Binary search
Query by index    │ O(log n + k)    │ k = results
Full scan         │ O(n)            │ Avoid when possible
Compound lookup   │ O(log n)        │ Very fast
Multi-entry       │ O(log n * m)    │ m = avg array size
Transaction       │ O(sum of ops)   │ Atomic batch
```

## Memory Model

```
┌────────────────────────────────────────┐
│         JavaScript Heap                │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  React Component State           │ │
│  │  • Only visible data in memory   │ │
│  │  • Hooks return live references  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Dexie.js Cache                  │ │
│  │  • Query result cache (small)    │ │
│  │  • Subscription management       │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
                  │
                  │ IPC
                  ▼
┌────────────────────────────────────────┐
│         IndexedDB (Disk)               │
│                                        │
│  • Persistent storage                 │
│  • Not loaded into memory             │
│  • Queried on demand                  │
│  • 50MB+ capacity                     │
│                                        │
└────────────────────────────────────────┘
```

## Security Model

```
┌──────────────────────────────────────────┐
│  Same-Origin Policy                      │
│                                          │
│  • Each domain has isolated IndexedDB   │
│  • prismspace.com ≠ example.com         │
│  • Cannot access other domains' data    │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Client-Side Only                        │
│                                          │
│  • No server-side access to IndexedDB   │
│  • Data stays on user's device          │
│  • Private by default                   │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  User Control                            │
│                                          │
│  • User can clear all data              │
│  • User can export backup               │
│  • User controls migrations             │
└──────────────────────────────────────────┘
```

## Future Architecture (Cloud Sync)

```
┌────────────────────┐
│  Browser IndexedDB │
│  (Local storage)   │
└─────────┬──────────┘
          │
          │ Sync queue
          ▼
┌────────────────────┐
│  Service Worker    │
│  (Background sync) │
└─────────┬──────────┘
          │
          │ WebSocket
          │ or REST API
          ▼
┌────────────────────┐
│  Cloud Backend     │
│  (PostgreSQL?)     │
└─────────┬──────────┘
          │
          │ Replicate
          ▼
┌────────────────────┐
│  Other Devices     │
│  (Phone, Tablet)   │
└────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────┐
│  Frontend: Next.js 15 + React 19   │
├─────────────────────────────────────┤
│  Language: TypeScript 5.7           │
├─────────────────────────────────────┤
│  Database: Dexie.js 4.4 + IndexedDB │
├─────────────────────────────────────┤
│  Reactivity: dexie-react-hooks 4.4  │
├─────────────────────────────────────┤
│  Import/Export: dexie-export-import │
└─────────────────────────────────────┘
```

---

**Version**: 1.0.0  
**Last Updated**: January 2025
