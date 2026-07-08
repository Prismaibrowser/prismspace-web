/**
 * app/api/hive/agents/[id]/route.ts
 * GET    /api/hive/agents/:id           — get one agent
 * POST   /api/hive/agents/:id/approve   — approve/reject (via sub-path, see approve/route.ts)
 * DELETE /api/hive/agents/:id           — remove agent
 */
import { NextRequest, NextResponse } from 'next/server';

const HIVE_URL = process.env.HIVE_API_URL ?? 'http://localhost:7433';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const res = await fetch(`${HIVE_URL}/api/agents/${id}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const res = await fetch(`${HIVE_URL}/api/agents/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 503 });
  }
}
