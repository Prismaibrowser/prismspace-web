/**
 * app/api/hive/health/route.ts
 * Proxies the health check from the Python Hive backend.
 */
import { NextResponse } from 'next/server';

const HIVE_URL = process.env.HIVE_API_URL ?? 'http://localhost:7433';

export async function GET() {
  try {
    const res = await fetch(`${HIVE_URL}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return NextResponse.json({ ...data, backend: HIVE_URL }, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: 'offline', error: 'Hive backend is not reachable', backend: HIVE_URL },
      { status: 503 },
    );
  }
}
