/**
 * app/api/hive/agents/[id]/logs/route.ts
 * GET /api/hive/agents/:id/logs
 *
 * Transparently proxies the Server-Sent Events stream from the Python backend.
 * The browser connects here; this route pipes the SSE bytes through without
 * buffering so clients see live updates as they arrive.
 */
import { NextRequest } from 'next/server';

const HIVE_URL = process.env.HIVE_API_URL ?? 'http://localhost:7433';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const since = req.nextUrl.searchParams.get('since') ?? '0';

  let upstream: Response;
  try {
    upstream = await fetch(`${HIVE_URL}/api/agents/${id}/logs?since=${since}`, {
      headers: { Accept: 'text/event-stream' },
    });
  } catch {
    return new Response('data: {"error":"Hive backend unavailable"}\n\n', {
      status: 503,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  // Pipe the response body directly to the browser
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
