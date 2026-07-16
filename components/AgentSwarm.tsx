'use client';

/**
 * components/AgentSwarm.tsx
 * ──────────────────────────
 * Full-panel Agent Swarm orchestration dashboard.
 * Shows live agent status, log streaming, HITL controls, and a task launcher.
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react';

// ── Custom dark-themed Select component ─────────────────────────────────────
interface SelectOption { value: string; label: string; }
interface StyledSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  className?: string;
}

function StyledSelect({ value, onChange, options, className = '' }: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ userSelect: 'none' }}>
      {/* Trigger */}
      <button
        type="button"
        id={uid}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-2 text-xs text-white outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: open ? '1px solid rgba(0,255,136,0.45)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: open ? '0 0 0 2px rgba(0,255,136,0.08)' : 'none',
        }}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M1 3l4 4 4-4" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(18,18,24,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.06)',
            backdropFilter: 'blur(20px)',
            animation: 'swarmDropIn 0.15s ease',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs transition-all"
              style={{
                color: opt.value === value ? '#00ff88' : 'rgba(255,255,255,0.75)',
                background: opt.value === value ? 'rgba(0,255,136,0.08)' : 'transparent',
                fontWeight: opt.value === value ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = opt.value === value ? 'rgba(0,255,136,0.08)' : 'transparent';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import {
  SwarmAgent,
  CreateAgentPayload,
  ModelProvider,
  createAgent,
  listAgents,
  approveAgent,
  streamAgentLogs,
  checkSwarmHealth,
  STATUS_COLORS,
  STATUS_LABELS,
  isTerminal,
} from '@/lib/agent-swarm-client';
import { AgentCard } from './AgentCard';
import { getAgentAvatarStyle } from '@/lib/agent-avatar';
import GridLoader from '@/components/ui/smoothui/grid-loader';

interface AgentSwarmProps {
  onClose: () => void;
}

const MODELS: Record<ModelProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'],
  google: ['gemini-2.5-pro', 'gemini-2.5-flash'],
  groq: ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768'],
};

export function AgentSwarm({ onClose }: AgentSwarmProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [agents, setAgents] = useState<SwarmAgent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);

  // New agent form
  const [objective, setObjective] = useState('');
  const [provider, setProvider] = useState<ModelProvider>('openai');
  const [model, setModel] = useState('gpt-4o');
  const [maxAgents, setMaxAgents] = useState(3);
  const [hitl, setHitl] = useState(true);
  const [launching, setLaunching] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const cleanupLogStream = useRef<(() => void) | null>(null);

  // ── Health check ──────────────────────────────────────────────────────────
  useEffect(() => {
    checkSwarmHealth().then(setBackendOnline);
    const interval = setInterval(() => checkSwarmHealth().then(setBackendOnline), 8000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch agents ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const data = await listAgents();
      setAgents(data);
    } catch {
      // backend offline
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  // ── Log streaming ─────────────────────────────────────────────────────────
  useEffect(() => {
    cleanupLogStream.current?.();
    cleanupLogStream.current = null;

    if (!selectedId) {
      setLogLines([]);
      return;
    }

    setLogLines([]);

    const stop = streamAgentLogs(
      selectedId,
      (line) => {
        setLogLines((prev) => [...prev, line]);
      },
      () => {},
    );
    cleanupLogStream.current = stop;

    return () => {
      stop();
      cleanupLogStream.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

  // ── Launch new agent ──────────────────────────────────────────────────────
  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || launching) return;

    setLaunching(true);
    try {
      const payload: CreateAgentPayload = {
        objective: objective.trim(),
        provider,
        model,
        max_agents: maxAgents,
        human_in_loop: hitl,
      };
      const agent = await createAgent(payload);
      setObjective('');
      setSelectedId(agent.id);
      await refresh();
    } finally {
      setLaunching(false);
    }
  };

  const handleProviderChange = (p: ModelProvider) => {
    setProvider(p);
    setModel(MODELS[p][0]);
  };

  const selectedAgent = agents.find((a) => a.id === selectedId);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background:
            'linear-gradient(135deg, rgba(0,255,136,0.06) 0%, rgba(0,100,255,0.04) 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐝</span>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Agent Swarm
            </h2>
            <p className="text-white/40 text-xs">Multi-Agent Orchestration · aden-hive/hive</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Backend status indicator */}
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  backendOnline === null
                    ? '#94a3b8'
                    : backendOnline
                    ? '#4ade80'
                    : '#f87171',
                boxShadow: backendOnline ? '0 0 6px #4ade80' : undefined,
                animation: backendOnline ? 'pulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <span className="text-xs text-white/50 font-mono">
              {backendOnline === null
                ? 'Checking…'
                : backendOnline
                ? 'Backend online'
                : 'Backend offline'}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Offline banner ─────────────────────────────────────────────────── */}
      {backendOnline === false && (
        <div
          className="px-6 py-3 text-sm flex items-start gap-3 flex-shrink-0"
          style={{
            background: 'rgba(248,113,113,0.1)',
            borderBottom: '1px solid rgba(248,113,113,0.2)',
          }}
        >
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-red-300">Agent Swarm backend is not running</p>
            <p className="text-red-300/70 text-xs mt-0.5">
              Start it with{' '}
              <code className="bg-black/30 px-1 rounded font-mono">
                .\hive-backend\start.ps1
              </code>{' '}
              in a separate terminal. The dashboard will reconnect automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Agent list + Launch form ──────────────────────────────── */}
        <div
          className="flex flex-col w-80 flex-shrink-0"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Launch form */}
          <form
            onSubmit={handleLaunch}
            className="p-4 space-y-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs text-white/50 font-semibold uppercase tracking-widest">
              Launch Swarm
            </p>

            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe the objective for the agent swarm…"
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 resize-none outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) =>
                (e.target.style.border = '1px solid rgba(0,255,136,0.4)')
              }
              onBlur={(e) =>
                (e.target.style.border = '1px solid rgba(255,255,255,0.1)')
              }
            />

            {/* Provider + Model */}
            <div className="flex gap-2">
              <StyledSelect
                className="flex-1"
                value={provider}
                onChange={(val) => handleProviderChange(val as ModelProvider)}
                options={[
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                  { value: 'google', label: 'Google' },
                  { value: 'groq', label: 'Groq' },
                ]}
              />
              <StyledSelect
                className="flex-1"
                value={model}
                onChange={setModel}
                options={MODELS[provider].map((m) => ({ value: m, label: m }))}
              />
            </div>

            {/* Sub-agents + HITL */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-white/60">
                <span>Agents:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxAgents}
                  onChange={(e) => setMaxAgents(Number(e.target.value))}
                  className="w-12 rounded px-1.5 py-1 text-xs text-white outline-none text-center"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </label>

              <label className="flex items-center gap-1.5 text-xs text-white/60 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={hitl}
                  onChange={(e) => setHitl(e.target.checked)}
                  className="accent-green-400"
                />
                <span>HITL</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!objective.trim() || launching || !backendOnline}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background:
                  !objective.trim() || !backendOnline
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)',
                color:
                  !objective.trim() || !backendOnline
                    ? 'rgba(255,255,255,0.3)'
                    : '#000',
                cursor:
                  !objective.trim() || !backendOnline ? 'not-allowed' : 'pointer',
                boxShadow:
                  objective.trim() && backendOnline
                    ? '0 4px 20px rgba(0,255,136,0.3)'
                    : 'none',
              }}
            >
              {launching ? '🚀 Launching…' : '🚀 Launch Swarm'}
            </button>
          </form>

          {/* Agent list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {agents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🐝</p>
                <p className="text-white/30 text-xs">No agents yet.</p>
                <p className="text-white/20 text-xs mt-1">
                  Launch a swarm above to get started.
                </p>
              </div>
            )}
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedId === agent.id}
                onSelect={() => setSelectedId(agent.id)}
                onRefresh={refresh}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT: Agent detail + log console ───────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedAgent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="mb-4 text-5xl opacity-30">🐝</div>
              <p className="text-white/30 text-sm">
                Select an agent to view its execution log
              </p>
            </div>
          ) : (
            <>
              {/* Agent detail header */}
              <div
                className="px-6 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {selectedAgent.objective}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{
                          background: `${STATUS_COLORS[selectedAgent.status]}22`,
                          border: `1px solid ${STATUS_COLORS[selectedAgent.status]}55`,
                          color: STATUS_COLORS[selectedAgent.status],
                        }}
                      >
                        {STATUS_LABELS[selectedAgent.status]}
                      </span>
                      <span className="text-white/30 text-xs font-mono">
                        {selectedAgent.provider}/{selectedAgent.model}
                      </span>
                      <span className="text-white/30 text-xs font-mono">
                        {selectedAgent.max_agents} agents
                      </span>
                      {selectedAgent.human_in_loop && (
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(251,191,36,0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(251,191,36,0.3)',
                          }}
                        >
                          HITL
                        </span>
                      )}
                    </div>

                    {/* ── Sub-agent avatar row ─────────────────────────── */}
                    {(() => {
                      const subAgents = Array.from(
                        { length: selectedAgent.max_agents },
                        (_, i) => `Agent-${String.fromCharCode(65 + i)}`,
                      );
                      // Determine which sub-agent spoke most recently in the logs
                      const lastLine = logLines[logLines.length - 1] ?? '';
                      const activeAgent = subAgents.find(name => lastLine.includes(name));

                      return (
                        <div className="flex items-center gap-2 mt-3">
                          {subAgents.map(name => {
                            const isActive = name === activeAgent;
                            return (
                              <div
                                key={name}
                                title={name}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <div
                                  style={{
                                    ...getAgentAvatarStyle(name, 44),
                                    border: isActive
                                      ? '2px solid #00ff88'
                                      : '2px solid rgba(255,255,255,0.08)',
                                    boxShadow: isActive
                                      ? '0 0 10px rgba(0,255,136,0.4)'
                                      : 'none',
                                    transition: 'border-color 0.3s, box-shadow 0.3s',
                                    opacity: isActive ? 1 : 0.5,
                                    overflow: 'hidden',
                                    backgroundSize: `${13 * 100}% ${7 * 100}%`,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontFamily: 'monospace',
                                    color: isActive ? '#00ff88' : 'rgba(255,255,255,0.3)',
                                    fontWeight: isActive ? 700 : 400,
                                    transition: 'color 0.3s',
                                  }}
                                >
                                  {name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* HITL controls in detail pane */}
                  {selectedAgent.status === 'awaiting_approval' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => approveAgent(selectedAgent.id, false).then(refresh)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'rgba(248,113,113,0.15)',
                          border: '1px solid rgba(248,113,113,0.4)',
                          color: '#f87171',
                        }}
                      >
                        ✕ Reject
                      </button>
                      <button
                        onClick={() => approveAgent(selectedAgent.id, true).then(refresh)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'rgba(74,222,128,0.15)',
                          border: '1px solid rgba(74,222,128,0.4)',
                          color: '#4ade80',
                        }}
                      >
                        ✓ Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>

                {/* Split View: Logs & Output */}
                <div className="flex flex-1 min-h-0">
                  {/* Log console */}
                  <div
                    className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                  >
                  <p className="text-white/20 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    ── Execution Log ── {selectedAgent.id.slice(0, 8)}
                  </p>

                  {logLines.length === 0 && (
                    <p className="text-white/20 italic">Waiting for log output…</p>
                  )}

                  {logLines.map((line, i) => {
                    const isError = line.includes('❌') || line.includes('⚠️') || line.includes('failed');
                    const isSuccess = line.includes('✅') || line.includes('🎉') || line.includes('completed');
                    const isWarning = line.includes('⏸️') || line.includes('checkpoint');

                    return (
                      <div
                        key={i}
                        className="leading-relaxed"
                        style={{
                          color: isError
                            ? '#f87171'
                            : isSuccess
                            ? '#4ade80'
                            : isWarning
                            ? '#fbbf24'
                            : 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {line}
                      </div>
                    );
                  })}

                  {/* Active state: GridLoader + status */}
                  {!isTerminal(selectedAgent.status) && (
                    <div
                      className="flex items-center gap-3 mt-3 pt-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <GridLoader
                        color="#00ff88"
                        mode={selectedAgent.status === 'planning' ? 'sequence' : 'stagger'}
                        sequence={[
                          'spiral-cw',
                          'plus-full',
                          'frame',
                          'x-shape',
                          'spiral-ccw',
                        ]}
                        pattern="plus-hollow"
                        size="sm"
                        gap={3}
                        rounded
                        speed="fast"
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#00ff88',
                          opacity: 0.8,
                          animation: 'blink 2s ease-in-out infinite',
                        }}
                      >
                        {selectedAgent.status === 'planning' && 'Compiling execution plan…'}
                        {selectedAgent.status === 'running' && 'Agents processing…'}
                        {selectedAgent.status === 'initialising' && 'Initialising runtime…'}
                        {selectedAgent.status === 'awaiting_approval' && 'Awaiting your approval…'}
                        {!['planning','running','initialising','awaiting_approval'].includes(selectedAgent.status) && 'Working…'}
                      </span>
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>

                {/* Final Output Panel */}
                {selectedAgent.result && isTerminal(selectedAgent.status) && (
                  <div
                    className="flex-1 overflow-y-auto p-6"
                    style={{
                      background: 'rgba(10,10,10,0.8)',
                      borderLeft: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                      <span className="text-green-400">✨</span> Final Output
                    </h3>
                    <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedAgent.result}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.15); }
        }
        @keyframes swarmDropIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
