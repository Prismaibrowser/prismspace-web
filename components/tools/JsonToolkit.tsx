'use client';

import { useState } from 'react';

interface JsonToolkitProps {
  onClose: () => void;
}

export function JsonToolkit({ onClose }: JsonToolkitProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setOutput('');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✅ Valid JSON');
    } catch (e) {
      setError('❌ Invalid JSON: ' + (e as Error).message);
      setOutput('');
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a0a] to-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-white/15 bg-white/[0.02]">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <span>📋</span>
          <span>JSON Toolkit</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 
                     border border-white/20 hover:bg-red-500/20 hover:border-red-500/40 
                     hover:text-red-500 transition-all text-xl"
        >
          ×
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 p-3 border-b border-white/15 bg-white/[0.03] flex-wrap">
        <button
          onClick={formatJson}
          className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 
                     hover:bg-blue-500/30 transition-all font-medium"
        >
          Format
        </button>
        <button
          onClick={minifyJson}
          className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 
                     hover:bg-purple-500/30 transition-all font-medium"
        >
          Minify
        </button>
        <button
          onClick={validateJson}
          className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 
                     hover:bg-green-500/30 transition-all font-medium"
        >
          Validate
        </button>
        <button
          onClick={copyOutput}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 
                     hover:bg-white/20 transition-all font-medium"
          disabled={!output}
        >
          Copy Output
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 
                     hover:bg-red-500/30 transition-all font-medium ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-3 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-3 overflow-hidden">
        {/* Input */}
        <div className="flex-1 flex flex-col">
          <label className="text-sm text-white/60 mb-2 font-medium">Input JSON:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg p-4 
                       text-white font-mono text-sm leading-relaxed resize-none outline-none
                       focus:bg-white/[0.05] focus:border-white/20 transition-all"
            placeholder='{"key": "value"}'
          />
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col">
          <label className="text-sm text-white/60 mb-2 font-medium">Output:</label>
          <textarea
            value={output}
            readOnly
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg p-4 
                       text-white font-mono text-sm leading-relaxed resize-none outline-none"
            placeholder="Output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
