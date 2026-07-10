'use client';

import { useMemo, useState } from 'react';

interface WebScraperToolProps {
  onClose: () => void;
}

interface ScrapePage {
  url: string;
  title: string;
  content: string;
  markdown: string;
  html: string;
}

interface ScrapeResult {
  baseUrl: string;
  scrapedAt: string;
  totalPages: number;
  pages: ScrapePage[];
}

type Format = 'json' | 'csv';
type Mode = 'single' | 'crawl';

export function WebScraperTool({ onClose }: WebScraperToolProps) {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<Format>('json');
  const [mode, setMode] = useState<Mode>('single');
  const [maxPages, setMaxPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jsonResult, setJsonResult] = useState<ScrapeResult | null>(null);
  const [csvResult, setCsvResult] = useState('');

  const resultText = useMemo(() => {
    if (format === 'csv') return csvResult;
    return jsonResult ? JSON.stringify(jsonResult, null, 2) : '';
  }, [csvResult, format, jsonResult]);

  const scrape = async () => {
    setLoading(true);
    setError('');
    setJsonResult(null);
    setCsvResult('');

    try {
      const response = await fetch('/api/scrape-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          format,
          mode,
          maxPages: mode === 'crawl' ? maxPages : 1,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Scrape failed.');
      }

      if (format === 'csv') {
        setCsvResult(await response.text());
      } else {
        setJsonResult((await response.json()) as ScrapeResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scrape failed.');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!resultText) return;

    const type = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([resultText], { type });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `scraped-docs.${format}`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  };

  const copy = async () => {
    if (resultText) {
      await navigator.clipboard.writeText(resultText);
    }
  };

  const pageCount = jsonResult?.totalPages ?? (csvResult ? Math.max(csvResult.split('\n').length - 1, 0) : 0);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#0a0a0a] to-black text-white">
      <div className="flex items-center justify-between border-b border-white/15 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <span>🧾</span>
          <span>Web Scraper</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xl transition-all hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-400"
          title="Close"
        >
          x
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[380px_1fr]">
        <section className="space-y-4 border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Link</label>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/docs"
              className="w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-white/80">Mode</span>
            <div className="grid grid-cols-2 gap-2">
              {(['single', 'crawl'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                    mode === value
                      ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100'
                      : 'border-white/15 bg-white/[0.06] text-white/70 hover:bg-white/[0.1]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {mode === 'crawl' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Max pages: <span className="font-mono text-white">{maxPages}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={maxPages}
                onChange={(event) => setMaxPages(Number(event.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          )}

          <div>
            <span className="mb-2 block text-sm font-medium text-white/80">Format</span>
            <div className="grid grid-cols-2 gap-2">
              {(['json', 'csv'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium uppercase transition ${
                    format === value
                      ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                      : 'border-white/15 bg-white/[0.06] text-white/70 hover:bg-white/[0.1]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={scrape}
            disabled={!url.trim() || loading}
            className="w-full rounded-lg border border-emerald-400/45 bg-emerald-400/15 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.05] disabled:text-white/35"
          >
            {loading ? 'Scraping...' : 'Scrape link'}
          </button>

          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white/60">
            <div className="flex justify-between gap-3">
              <span>Pages scraped</span>
              <strong className="font-mono text-white">{pageCount}</strong>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span>Output</span>
              <strong className="font-mono uppercase text-white">{format}</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copy}
              disabled={!resultText}
              className="flex-1 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:text-white/35"
            >
              Copy
            </button>
            <button
              onClick={download}
              disabled={!resultText}
              className="flex-1 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:text-white/35"
            >
              Download
            </button>
          </div>
        </section>

        <section className="flex min-h-0 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Result Preview</h2>
            {jsonResult && (
              <span className="truncate text-xs text-white/45">
                {jsonResult.baseUrl}
              </span>
            )}
          </div>

          {resultText ? (
            <pre className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10 bg-black/45 p-4 font-mono text-xs leading-relaxed text-white/75">
              {resultText}
            </pre>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.03] p-8 text-center text-sm text-white/35">
              Paste a link and scrape it to preview JSON or CSV here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
