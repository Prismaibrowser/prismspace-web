export type ScrapeOutputFormat = 'json' | 'csv';
export type ScrapeMode = 'single' | 'crawl';

export interface ScrapePage {
  url: string;
  title: string;
  content: string;
  markdown: string;
  html: string;
}

export interface ScrapeResult {
  baseUrl: string;
  scrapedAt: string;
  totalPages: number;
  pages: ScrapePage[];
}

interface ScrapeOptions {
  url: string;
  mode?: ScrapeMode;
  maxPages?: number;
}

const USER_AGENT = 'PrismSpaceScraper/1.0';
const DEFAULT_MAX_PAGES = 8;
const MAX_ALLOWED_PAGES = 20;

export function normalizeScrapeUrl(rawUrl: string) {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(withProtocol);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS links are supported.');
  }
  parsed.hash = '';
  return parsed;
}

export function isBlockedHostname(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '::1' || host.endsWith('.local')) return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  const private172 = host.match(/^172\.(\d+)\./);
  return Boolean(private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31);
}

function decodeEntities(text: string) {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity[0] === '#') {
      const radix = entity[1]?.toLowerCase() === 'x' ? 16 : 10;
      const codePoint = Number.parseInt(entity.replace(/^#x?/i, ''), radix);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
    }

    return entities[entity.toLowerCase()] ?? '';
  });
}

function stripNoise(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '');
}

function getFirstTagContent(html: string, tagName: string) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match?.[1] ?? '';
}

function getTitle(html: string) {
  const h1 = cleanText(getFirstTagContent(html, 'h1'));
  if (h1) return h1;

  const title = cleanText(getFirstTagContent(html, 'title'));
  return title || 'Untitled';
}

function getMainHtml(html: string) {
  const main = getFirstTagContent(html, 'main');
  if (main) return main;

  const article = getFirstTagContent(html, 'article');
  if (article) return article;

  const prose = html.match(/<div[^>]+class=["'][^"']*(?:prose|markdown|content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  return prose?.[1] ?? html;
}

function cleanText(htmlOrText: string) {
  return decodeEntities(
    htmlOrText
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|section|article|main|li|tr|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim(),
  );
}

function htmlToMarkdown(html: string) {
  let markdown = html;

  markdown = markdown.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, code: string) => {
    return `\n\n\`\`\`\n${cleanText(code)}\n\`\`\`\n\n`;
  });
  markdown = markdown.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, text: string) => {
    return `\n\n${'#'.repeat(Number(level))} ${cleanText(text)}\n\n`;
  });
  markdown = markdown.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, text: string) => {
    const label = cleanText(text);
    return label ? `[${label}](${href})` : href;
  });
  markdown = markdown.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text: string) => `\n- ${cleanText(text)}`);
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text: string) => `\n\n${cleanText(text)}\n\n`);
  markdown = cleanText(markdown);

  return markdown;
}

function absolutizeLink(href: string, currentUrl: URL) {
  try {
    const url = new URL(href, currentUrl);
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

function discoverLinks(html: string, currentUrl: URL, baseUrl: URL) {
  const links = new Set<string>();
  const basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;
  const anchorPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const link = absolutizeLink(match[1], currentUrl);
    if (!link) continue;
    if (link.origin !== baseUrl.origin) continue;
    if (!link.pathname.startsWith(basePath) && link.pathname !== baseUrl.pathname) continue;
    if (/\.(png|jpe?g|gif|svg|webp|pdf|zip|mp4|mov)$/i.test(link.pathname)) continue;
    links.add(link.toString());
  }

  return [...links];
}

async function fetchHtml(url: URL) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.toString()} (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType && !contentType.includes('text/html')) {
    throw new Error(`Expected an HTML page, received ${contentType}.`);
  }

  return response.text();
}

export function parseScrapePage(url: string, html: string): ScrapePage {
  const cleaned = stripNoise(html);
  const mainHtml = getMainHtml(cleaned);
  const title = getTitle(cleaned);
  const markdown = htmlToMarkdown(mainHtml);

  return {
    url,
    title,
    content: cleanText(mainHtml),
    markdown: markdown.startsWith('#') ? markdown : `# ${title}\n\n${markdown}`.trim(),
    html: mainHtml.trim(),
  };
}

export async function scrapeDocs(options: ScrapeOptions): Promise<ScrapeResult> {
  const baseUrl = normalizeScrapeUrl(options.url);
  if (isBlockedHostname(baseUrl.hostname)) {
    throw new Error('Local and private network URLs are blocked for safety.');
  }

  const mode = options.mode ?? 'single';
  const maxPages = Math.min(Math.max(options.maxPages ?? DEFAULT_MAX_PAGES, 1), MAX_ALLOWED_PAGES);
  const queue = [baseUrl.toString()];
  const visited = new Set<string>();
  const pages: ScrapePage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const next = queue.shift();
    if (!next || visited.has(next)) continue;
    visited.add(next);

    const currentUrl = new URL(next);
    const html = await fetchHtml(currentUrl);
    pages.push(parseScrapePage(currentUrl.toString(), html));

    if (mode === 'crawl') {
      for (const link of discoverLinks(html, currentUrl, baseUrl)) {
        if (!visited.has(link) && !queue.includes(link) && pages.length + queue.length < maxPages) {
          queue.push(link);
        }
      }
    }
  }

  return {
    baseUrl: baseUrl.toString(),
    scrapedAt: new Date().toISOString(),
    totalPages: pages.length,
    pages,
  };
}

function csvCell(value: string | number) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function scrapeResultToCsv(result: ScrapeResult) {
  const header = ['title', 'url', 'content', 'markdown', 'html'];
  const rows = result.pages.map((page) => [
    page.title,
    page.url,
    page.content,
    page.markdown,
    page.html,
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
