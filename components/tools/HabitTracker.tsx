'use client';

import { useState, useEffect } from 'react';

interface Habit {
  id: string;
  name: string;
  icon: string;
  targetType: 'daily' | 'weekly';
  targetCount: number;
  color: string;
  history: Record<string, number>;
}

interface HabitTrackerProps {
  onClose?: () => void;
}

const icons = ['📚', '⚡', '❤️', '💧', '🧠', '🚴', '🍃', '🌙', '☀️', '🎵', '💻', '✏️', '🏋️', '☕', '🚶', '🏠', '✨', '😊', '🛡️', '🎯'];

export function HabitTracker({ onClose }: HabitTrackerProps) {
  const STORAGE_KEY = 'prism.habits.v1';
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);
  const [targetType, setTargetType] = useState<'daily' | 'weekly'>('daily');
  const [targetCount, setTargetCount] = useState(4);
  const [habitColor, setHabitColor] = useState('#22c55e');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHabits(JSON.parse(saved));
      }
    } catch {}
  };

  const saveHabits = (newHabits: Habit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));
    setHabits(newHabits);
  };

  const uid = () => Math.random().toString(36).slice(2, 10);

  const dateKey = (date: Date) => date.toISOString().slice(0, 10);

  const today = dateKey(new Date());

  const addHabit = () => {
    if (!habitName.trim()) return;

    const newHabit: Habit = {
      id: uid(),
      name: habitName.trim(),
      icon: selectedIcon,
      targetType,
      targetCount,
      color: habitColor,
      history: {},
    };

    saveHabits([...habits, newHabit]);
    setHabitName('');
  };

  const addCompletion = (habitId: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          history: {
            ...habit.history,
            [today]: (habit.history[today] || 0) + 1,
          },
        };
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const hitTarget = (habit: Habit, date: string = today) => {
    const value = habit.history[date] || 0;
    return habit.targetType === 'daily' ? value >= 1 : value >= habit.targetCount;
  };

  const getStreaks = (habit: Habit) => {
    let current = 0;
    let best = 0;
    const cursor = new Date();
    
    // Current streak
    while (hitTarget(habit, dateKey(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Best streak
    const keys = Object.keys(habit.history).sort();
    let run = 0;
    
    keys.forEach(key => {
      if ((habit.history[key] || 0) >= (habit.targetType === 'daily' ? 1 : habit.targetCount)) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    });

    return { current, best };
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    
    const fromIndex = habits.findIndex(h => h.id === draggedId);
    const toIndex = habits.findIndex(h => h.id === targetId);
    
    const newHabits = [...habits];
    const [movedHabit] = newHabits.splice(fromIndex, 1);
    newHabits.splice(toIndex, 0, movedHabit);
    
    saveHabits(newHabits);
    setDraggedId(null);
  };

  const renderHeatmap = (habit: Habit) => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = dateKey(date);
      const value = habit.history[key] || 0;
      const target = habit.targetType === 'daily' ? 1 : habit.targetCount;
      const intensity = Math.min(1, value / Math.max(1, target));
      
      days.push({ key, value, intensity });
    }

    return (
      <div className="grid grid-cols-10 gap-1">
        {days.map(day => (
          <div
            key={day.key}
            className="w-7 h-7 rounded-md border border-[rgba(255,255,255,0.08)]"
            style={{
              backgroundColor: day.value
                ? `rgba(34,197,94,${0.18 + day.intensity * 0.72})`
                : 'rgba(255,255,255,0.05)',
            }}
            title={`${day.key}: ${day.value}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-[#17293c] via-[#0a0d12] to-[#0a0d12] text-white p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <p className="text-sm text-slate-400 mt-2">
          Daily tracking, streaks, weekly targets, drag-and-drop ordering, and per-habit history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        {/* Add Habit Panel */}
        <section className="bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px] space-y-3">
          <h2 className="text-xl font-bold">Add Habit</h2>
          
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="Habit name"
            className="w-full bg-[#0f141b] border border-[#283341] rounded-xl px-3 py-2 text-white"
          />
          
          <div className="grid grid-cols-5 gap-2">
            {icons.map(icon => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`p-3 rounded-xl border text-2xl transition ${
                  selectedIcon === icon
                    ? 'border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.08)]'
                    : 'border-[#283341] bg-[#0f141b] hover:bg-[#1a2330]'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as 'daily' | 'weekly')}
              className="flex-1 bg-[#0f141b] border border-[#283341] rounded-xl px-3 py-2 text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">X times per week</option>
            </select>
            
            <input
              type="number"
              min="1"
              max="7"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-20 bg-[#0f141b] border border-[#283341] rounded-xl px-3 py-2 text-white"
            />
            
            <input
              type="color"
              value={habitColor}
              onChange={(e) => setHabitColor(e.target.value)}
              className="w-16 bg-[#0f141b] border border-[#283341] rounded-xl p-1"
            />
          </div>
          
          <button
            onClick={addHabit}
            className="w-full bg-[rgba(34,197,94,0.14)] border border-[rgba(34,197,94,0.42)] rounded-xl px-3 py-2 hover:bg-[rgba(34,197,94,0.2)] transition"
          >
            Add habit
          </button>
        </section>

        {/* Habits List */}
        <section className="bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Today</h2>
            <div className="text-sm text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          {habits.length === 0 ? (
            <div className="text-sm text-slate-400">No habits yet.</div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => {
                const streaks = getStreaks(habit);
                const isDone = hitTarget(habit);
                
                return (
                  <div
                    key={habit.id}
                    draggable
                    onDragStart={() => setDraggedId(habit.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(habit.id)}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-3 bg-[#0f141b] border border-[#283341] rounded-2xl cursor-grab"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${habit.color}22`, color: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    
                    <div>
                      <strong className="block">{habit.name}</strong>
                      <div className="text-sm text-slate-400 mt-1">
                        Current {streaks.current} | Best {streaks.best} | {habit.targetType === 'daily' ? 'Daily' : `${habit.targetCount} / week`}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => addCompletion(habit.id)}
                        className={`w-12 h-12 rounded-2xl text-xl border transition ${
                          isDone
                            ? 'bg-[rgba(34,197,94,0.18)] border-[rgba(34,197,94,0.5)]'
                            : 'bg-[#0f141b] border-[#283341] hover:bg-[#1a2330]'
                        }`}
                      >
                        {isDone ? '✓' : '+'}
                      </button>
                      <button
                        onClick={() => setSelectedHabitId(habit.id === selectedHabitId ? null : habit.id)}
                        className="bg-[#0f141b] border border-[#283341] rounded-xl px-3 py-1 text-sm hover:bg-[#1a2330] transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Heatmap Section */}
      {habits.length > 0 && (
        <section className="mt-5 bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px]">
          <h2 className="text-xl font-bold mb-4">Monthly Heatmap</h2>
          {selectedHabitId ? (
            <>
              <h3 className="text-lg mb-3">
                {habits.find(h => h.id === selectedHabitId)?.name}
              </h3>
              {renderHeatmap(habits.find(h => h.id === selectedHabitId)!)}
            </>
          ) : (
            <div className="text-sm text-slate-400">Select a habit to view its heatmap</div>
          )}
        </section>
      )}
    </div>
  );
}
