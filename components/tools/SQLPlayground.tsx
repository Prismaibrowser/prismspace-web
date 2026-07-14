'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface SQLPlaygroundProps {
  onClose: () => void;
}

interface QueryResult {
  columns: string[];
  values: (string | number | null)[][];
}

interface DBInstance {
  exec: (opts: {
    sql: string;
    rowMode: string;
    resultRows?: unknown[];
    callback?: (row: Record<string, unknown>) => void;
  }) => void;
}

interface SQLiteModule {
  oo1: { DB: new () => DBInstance };
  capi: {
    sqlite3_libversion: () => string;
    sqlite3_js_db_export: (ptr: unknown) => Uint8Array;
    sqlite3_deserialize: (...args: unknown[]) => void;
    SQLITE_DESERIALIZE_FREEONCLOSE: number;
    SQLITE_DESERIALIZE_RESIZEABLE: number;
  };
  wasm: { allocFromTypedArray: (arr: Uint8Array) => unknown };
}

declare global {
  interface Window {
    sqlite3InitModule?: (config: { print: typeof console.log; printErr: typeof console.error }) => Promise<SQLiteModule>;
  }
}

const STARTER_SQL = `-- Welcome to SQL Playground!
-- Press Ctrl+Enter or click Run to execute.

CREATE TABLE IF NOT EXISTS users (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT    NOT NULL,
  role TEXT    NOT NULL
);

INSERT OR IGNORE INTO users (id, name, role) VALUES
  (1, 'Alice',   'admin'),
  (2, 'Bob',     'editor'),
  (3, 'Charlie', 'viewer');

SELECT * FROM users;
`;

const SCHEMA_SQL = `SELECT name FROM sqlite_schema
WHERE type = 'table'
  AND name NOT LIKE 'sqlite_%'
  AND name NOT LIKE 'sqlean_%'
ORDER BY name`;

export function SQLPlayground({ onClose }: SQLPlaygroundProps) {
  // Engine state
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const sqliteRef = useRef<SQLiteModule | null>(null);
  const dbRef = useRef<DBInstance | null>(null);

  // Editor / results state
  const [sql, setSql] = useState(STARTER_SQL);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'ok' | 'error'; msg: string }>({ type: 'idle', msg: 'Ready' });
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'tables'>('results');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load SQLite WASM ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // inject <script> if not already present
        if (!window.sqlite3InitModule) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = '/sqlite/sqlean.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Failed to load sqlean.js'));
            document.head.appendChild(s);
          });
        }
        if (!window.sqlite3InitModule) throw new Error('sqlite3InitModule not found');
        const sqlite3 = await window.sqlite3InitModule({ print: console.log, printErr: console.error });
        if (cancelled) return;
        sqliteRef.current = sqlite3;
        const db = new sqlite3.oo1.DB();
        dbRef.current = db;
        setReady(true);
        setStatus({ type: 'idle', msg: `SQLite ${sqlite3.capi.sqlite3_libversion()} ready` });
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load SQLite WASM');
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Execute SQL ─────────────────────────────────────────────────────
  const execute = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;

    const query = (() => {
      const textarea = textareaRef.current;
      if (!textarea) return sql;
      const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
      return sel || sql;
    })();

    if (!query.trim()) {
      setStatus({ type: 'idle', msg: 'Nothing to run' });
      return;
    }

    const t0 = performance.now();
    try {
      const rows: unknown[] = [];
      db.exec({ sql: query, rowMode: 'object', resultRows: rows });
      const ms = Math.round(performance.now() - t0);
      setElapsed(ms);

      if (!rows.length) {
        setResult(null);
        setStatus({ type: 'ok', msg: `OK — 0 rows (${ms} ms)` });
      } else {
        const columns = Object.keys(rows[0] as object);
        const values = (rows as Record<string, unknown>[]).map((r) => columns.map((c) => r[c] as string | number | null));
        setResult({ columns, values });
        setStatus({ type: 'ok', msg: `${rows.length} row${rows.length === 1 ? '' : 's'} (${ms} ms)` });
      }

      // refresh table list
      const tableRows: unknown[] = [];
      db.exec({ sql: SCHEMA_SQL, rowMode: 'object', resultRows: tableRows });
      setTables((tableRows as { name: string }[]).map((r) => r.name));
      setActiveTab('results');
    } catch (e) {
      const ms = Math.round(performance.now() - t0);
      setElapsed(ms);
      const msg = e instanceof Error ? e.message.split('\n')[0] : String(e);
      setResult(null);
      setStatus({ type: 'error', msg });
    }
  }, [sql]);

  // ── Show a table's content ──────────────────────────────────────────
  const showTable = useCallback((table: string) => {
    setSql(`SELECT * FROM "${table}" LIMIT 100;`);
    setTimeout(() => execute(), 10);
  }, [execute]);

  // ── Keyboard shortcut ───────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.keyCode === 13)) {
      e.preventDefault();
      execute();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = el.value.substring(0, start) + '  ' + el.value.substring(end);
      setSql(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }, [execute]);

  // ── Import .db or .sql file ─────────────────────────────────────────
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sqliteRef.current) return;
    const sqlite3 = sqliteRef.current;
    const isSql = file.name.endsWith('.sql');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const newDb = (() => {
          if (isSql) {
            const db = new sqlite3.oo1.DB();
            db.exec({ sql: reader.result as string, rowMode: 'object' });
            return db;
          } else {
            const bytes = new Uint8Array(reader.result as ArrayBuffer);
            const p = sqlite3.wasm.allocFromTypedArray(bytes);
            const db = new sqlite3.oo1.DB();
            sqlite3.capi.sqlite3_deserialize(
              (db as unknown as { pointer: unknown }).pointer,
              'main', p, bytes.length, bytes.length,
              sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE,
            );
            return db;
          }
        })();
        dbRef.current = newDb;
        const tableRows: unknown[] = [];
        newDb.exec({ sql: SCHEMA_SQL, rowMode: 'object', resultRows: tableRows });
        const tbls = (tableRows as { name: string }[]).map((r) => r.name);
        setTables(tbls);
        setResult(null);
        setStatus({ type: 'ok', msg: `Loaded "${file.name}" — ${tbls.length} table${tbls.length === 1 ? '' : 's'}` });
        if (tbls.length) {
          const q = `SELECT * FROM "${tbls[0]}" LIMIT 100;`;
          setSql(q);
          setActiveTab('tables');
        }
      } catch (err) {
        setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Import failed' });
      }
    };
    isSql ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    e.target.value = '';
  }, []);

  // ── Export current result as CSV ────────────────────────────────────
  const exportCsv = useCallback(() => {
    if (!result) return;
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [result.columns, ...result.values].map((row) => row.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'result.csv' });
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  // ── Reset database ──────────────────────────────────────────────────
  const resetDb = useCallback(() => {
    if (!sqliteRef.current) return;
    try {
      dbRef.current = new sqliteRef.current.oo1.DB();
      setTables([]);
      setResult(null);
      setSql(STARTER_SQL);
      setStatus({ type: 'ok', msg: 'Database reset' });
    } catch (e) {
      setStatus({ type: 'error', msg: 'Reset failed' });
    }
  }, []);

  // ── UI ──────────────────────────────────────────────────────────────
  return (
    <div className="sql-pg-root">
      {/* ── Header ── */}
      <header className="sql-pg-header">
        <div className="sql-pg-logo">
          <span className="sql-pg-logo-icon">⬡</span>
          <span className="sql-pg-logo-text">SQL <span className="sql-pg-logo-accent">Playground</span></span>
          {ready && <span className="sql-pg-version-badge">SQLite</span>}
        </div>

        <div className="sql-pg-header-actions">
          <label className="sql-pg-btn sql-pg-btn-ghost" title="Import .db or .sql file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
            <input type="file" accept=".db,.sqlite,.sql" onChange={handleFileImport} style={{ display: 'none' }} />
          </label>
          <button className="sql-pg-btn sql-pg-btn-ghost" onClick={resetDb} title="Reset to a fresh in-memory database">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Reset
          </button>
          <button className="sql-pg-btn sql-pg-btn-ghost sql-pg-close" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="sql-pg-body">

        {/* ── Sidebar: schema ── */}
        <aside className="sql-pg-sidebar">
          <div className="sql-pg-sidebar-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            Schema
          </div>
          {tables.length === 0 ? (
            <p className="sql-pg-sidebar-empty">No tables yet</p>
          ) : (
            <ul className="sql-pg-table-list">
              {tables.map((t) => (
                <li key={t}>
                  <button className="sql-pg-table-btn" onClick={() => showTable(t)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ── Main pane ── */}
        <main className="sql-pg-main">

          {/* Editor */}
          <section className="sql-pg-editor-section">
            <div className="sql-pg-editor-header">
              <span className="sql-pg-editor-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                SQL Editor
              </span>
              <span className="sql-pg-shortcut-hint">Ctrl+Enter to run · Tab to indent · Select to run partial</span>
            </div>
            <div className="sql-pg-editor-wrap">
              <div className="sql-pg-line-numbers" aria-hidden>
                {sql.split('\n').map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className="sql-pg-textarea"
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                disabled={!ready}
                placeholder={ready ? 'Type your SQL here…' : 'Loading SQLite…'}
              />
            </div>

            {/* Run bar */}
            <div className="sql-pg-run-bar">
              <button
                className="sql-pg-run-btn"
                onClick={execute}
                disabled={!ready}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run
              </button>

              {/* Status */}
              <div className={`sql-pg-status sql-pg-status--${status.type}`}>
                {status.type === 'ok' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {status.type === 'error' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
                <span>{loadError || status.msg}</span>
              </div>

              {result && (
                <button className="sql-pg-btn sql-pg-btn-ghost sql-pg-export-btn" onClick={exportCsv}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export CSV
                </button>
              )}
            </div>
          </section>

          {/* Results */}
          <section className="sql-pg-results-section">
            {!ready && !loadError && (
              <div className="sql-pg-loading">
                <div className="sql-pg-spinner" />
                <p>Loading SQLite WASM engine…</p>
              </div>
            )}
            {loadError && (
              <div className="sql-pg-error-state">
                <p>⚠️ {loadError}</p>
              </div>
            )}
            {ready && result && (
              <div className="sql-pg-table-wrap">
                <table className="sql-pg-table">
                  <thead>
                    <tr>
                      {result.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.values.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'sql-pg-row-even' : 'sql-pg-row-odd'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className={cell === null ? 'sql-pg-cell-null' : ''}>
                            {cell === null ? <span className="sql-pg-null">NULL</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {ready && !result && status.type !== 'error' && (
              <div className="sql-pg-empty-results">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                <p>Run a query to see results</p>
              </div>
            )}
            {ready && status.type === 'error' && (
              <div className="sql-pg-error-result">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <pre>{status.msg}</pre>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* ── Root ── */
        .sql-pg-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #09090b;
          color: #e4e4e7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          overflow: hidden;
        }

        /* ── Header ── */
        .sql-pg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 48px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          flex-shrink: 0;
          gap: 12px;
        }

        .sql-pg-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #f4f4f5;
        }
        .sql-pg-logo-icon {
          font-size: 16px;
          color: #7c3aed;
          line-height: 1;
        }
        .sql-pg-logo-text { color: #a1a1aa; }
        .sql-pg-logo-accent { color: #a78bfa; }
        .sql-pg-version-badge {
          font-size: 10px;
          font-weight: 500;
          background: rgba(124, 58, 237, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 4px;
          padding: 1px 6px;
          letter-spacing: 0.02em;
        }

        .sql-pg-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Buttons ── */
        .sql-pg-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border: none;
          white-space: nowrap;
        }
        .sql-pg-btn-ghost {
          background: rgba(255,255,255,0.05);
          color: #a1a1aa;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sql-pg-btn-ghost:hover {
          background: rgba(255,255,255,0.09);
          color: #e4e4e7;
        }
        .sql-pg-close:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-color: rgba(239,68,68,0.2);
        }

        .sql-pg-run-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          background: #7c3aed;
          color: white;
          border: none;
          transition: background 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .sql-pg-run-btn:hover:not(:disabled) { background: #6d28d9; }
        .sql-pg-run-btn:active:not(:disabled) { transform: scale(0.97); }
        .sql-pg-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Body layout ── */
        .sql-pg-body {
          display: grid;
          grid-template-columns: 180px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .sql-pg-sidebar {
          border-right: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.01);
          padding: 12px 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sql-pg-sidebar-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
          padding: 0 4px;
          margin-bottom: 4px;
        }
        .sql-pg-sidebar-empty {
          font-size: 11px;
          color: #3f3f46;
          padding: 4px 4px;
          font-style: italic;
        }
        .sql-pg-table-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .sql-pg-table-btn {
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 6px;
          border-radius: 5px;
          background: none;
          border: none;
          color: #a1a1aa;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sql-pg-table-btn:hover {
          background: rgba(124, 58, 237, 0.12);
          color: #c4b5fd;
        }

        /* ── Main ── */
        .sql-pg-main {
          display: grid;
          grid-template-rows: auto 1fr;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Editor section ── */
        .sql-pg-editor-section {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .sql-pg-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(255,255,255,0.015);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 12px;
        }
        .sql-pg-editor-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #52525b;
        }
        .sql-pg-shortcut-hint {
          font-size: 10px;
          color: #3f3f46;
        }

        .sql-pg-editor-wrap {
          display: grid;
          grid-template-columns: 36px 1fr;
          min-height: 180px;
          max-height: 280px;
          overflow: hidden;
          background: #09090b;
        }
        .sql-pg-line-numbers {
          display: flex;
          flex-direction: column;
          padding: 12px 0;
          background: rgba(0,0,0,0.3);
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          user-select: none;
          text-align: right;
          padding-right: 8px;
          padding-left: 4px;
        }
        .sql-pg-line-numbers span {
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 11px;
          line-height: 1.6;
          color: #3f3f46;
        }
        .sql-pg-textarea {
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
          font-size: 12.5px;
          line-height: 1.6;
          padding: 12px;
          background: transparent;
          border: none;
          outline: none;
          color: #e4e4e7;
          resize: none;
          overflow-y: auto;
          tab-size: 2;
          caret-color: #a78bfa;
        }
        .sql-pg-textarea::selection { background: rgba(124, 58, 237, 0.3); }
        .sql-pg-textarea:disabled { opacity: 0.4; }
        .sql-pg-textarea::placeholder { color: #3f3f46; }

        /* ── Run bar ── */
        .sql-pg-run-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(0,0,0,0.2);
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
        }
        .sql-pg-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sql-pg-status--idle { color: #52525b; }
        .sql-pg-status--ok { color: #4ade80; }
        .sql-pg-status--error { color: #f87171; }

        .sql-pg-export-btn { margin-left: auto; }

        /* ── Results section ── */
        .sql-pg-results-section {
          overflow: auto;
          min-height: 0;
          position: relative;
        }

        .sql-pg-loading,
        .sql-pg-empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
          color: #3f3f46;
          font-size: 13px;
        }

        .sql-pg-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(124,58,237,0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: sql-spin 0.8s linear infinite;
        }
        @keyframes sql-spin {
          to { transform: rotate(360deg); }
        }

        .sql-pg-error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #f87171;
          font-size: 13px;
          padding: 24px;
          text-align: center;
        }
        .sql-pg-error-result {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 16px;
          color: #f87171;
          font-size: 12px;
        }
        .sql-pg-error-result pre {
          font-family: inherit;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          flex: 1;
        }

        /* ── Results table ── */
        .sql-pg-table-wrap {
          overflow: auto;
          height: 100%;
        }
        .sql-pg-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .sql-pg-table thead tr {
          position: sticky;
          top: 0;
          background: #141417;
          z-index: 1;
        }
        .sql-pg-table th {
          padding: 8px 12px;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7c3aed;
          border-bottom: 1px solid rgba(124, 58, 237, 0.2);
          white-space: nowrap;
        }
        .sql-pg-table td {
          padding: 7px 12px;
          color: #d4d4d8;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          white-space: nowrap;
          max-width: 320px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sql-pg-row-even td { background: transparent; }
        .sql-pg-row-odd td { background: rgba(255,255,255,0.015); }
        .sql-pg-table tr:hover td { background: rgba(124,58,237,0.06); }
        .sql-pg-null {
          font-style: italic;
          color: #52525b;
          font-size: 11px;
        }
        .sql-pg-cell-null { color: #52525b; }

        /* ── Scrollbar ── */
        .sql-pg-root ::-webkit-scrollbar { width: 6px; height: 6px; }
        .sql-pg-root ::-webkit-scrollbar-track { background: transparent; }
        .sql-pg-root ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .sql-pg-root ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

        @media (prefers-reduced-motion: reduce) {
          .sql-pg-spinner { animation: none; opacity: 0.4; }
          .sql-pg-run-btn { transition: none; }
        }
      `}</style>
    </div>
  );
}
