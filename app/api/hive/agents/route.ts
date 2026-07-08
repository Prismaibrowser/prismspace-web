/**
 * app/api/hive/agents/route.ts
 * GET  /api/hive/agents   — list all agents
 * POST /api/hive/agents   — create a new agent
 */
import { NextRequest, NextResponse } from 'next/server';

const HIVE_URL = process.env.HIVE_API_URL ?? 'http://localhost:7433';

export async function GET() {
  try {
    const res = await fetch(`${HIVE_URL}/api/agents`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Hive backend unavailable', detail: String(err) },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${HIVE_URL}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Hive backend unavailable', detail: String(err) },
      { status: 503 },
    );
  }
}
