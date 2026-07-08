"""
Hive Multi-Agent Backend Bridge
================================
A FastAPI server that sits between the PrismSpace Next.js frontend and the
aden-hive/hive Python runtime. Exposes a clean REST + SSE API so the
browser dashboard can control and observe Hive agent runs.

Run with:
    python hive_api.py          # development (auto-reload)
    uvicorn hive_api:app        # production

Requires: fastapi, uvicorn, hive (from aden-hive/hive clone)
"""

from __future__ import annotations

import asyncio
import json
import os
import time
import uuid
from datetime import datetime
from typing import AsyncGenerator, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Hive Bridge API",
    description="Multi-Agent Harness for PrismSpace – powered by aden-hive/hive",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory store (replace with Hive's persistent storage in production)
# ---------------------------------------------------------------------------

# agent_id -> agent dict
_agents: dict[str, dict] = {}

# agent_id -> list of log lines
_logs: dict[str, list[str]] = {}

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class CreateAgentRequest(BaseModel):
    objective: str
    model: str = "gpt-4o"          # any Hive-supported model
    provider: str = "openai"       # openai | anthropic | google
    max_agents: int = 3
    human_in_loop: bool = True


class ApproveAgentRequest(BaseModel):
    approved: bool
    message: Optional[str] = None


# ---------------------------------------------------------------------------
# Helper: emit a log line to the in-memory log ring
# ---------------------------------------------------------------------------

def _log(agent_id: str, message: str) -> None:
    timestamp = datetime.utcnow().strftime("%H:%M:%S")
    entry = f"[{timestamp}] {message}"
    _logs.setdefault(agent_id, []).append(entry)


# ---------------------------------------------------------------------------
# Background task: simulated Hive agent run
# In production, replace this with real Hive orchestration calls.
# ---------------------------------------------------------------------------

async def _run_hive_agent(agent_id: str, request: CreateAgentRequest) -> None:
    """
    Drives the agent through its lifecycle stages.

    Real integration: import from hive and call something like:
        from hive import HiveRuntime
        runtime = HiveRuntime(model=request.model, provider=request.provider)
        async for event in runtime.run(objective=request.objective):
            _log(agent_id, event.message)
            ...
    """
    agent = _agents[agent_id]
    _log(agent_id, f"🚀 Initialising Hive runtime ({request.provider}/{request.model})")
    await asyncio.sleep(0.5)

    # --- Planning phase ---
    agent["status"] = "planning"
    agent["updated_at"] = datetime.utcnow().isoformat()
    _log(agent_id, f"🧠 Compiling execution DAG for: «{request.objective}»")
    await asyncio.sleep(1.0)

    _log(agent_id, f"📐 Spawning {request.max_agents} specialised sub-agents")
    sub_agents = [f"Agent-{chr(65+i)}" for i in range(request.max_agents)]
    for sa in sub_agents:
        _log(agent_id, f"   ↳ {sa} ready")
        await asyncio.sleep(0.3)

    # --- Running phase ---
    agent["status"] = "running"
    agent["updated_at"] = datetime.utcnow().isoformat()

    if request.human_in_loop:
        agent["status"] = "awaiting_approval"
        agent["updated_at"] = datetime.utcnow().isoformat()
        _log(agent_id, "⏸️  Human-in-the-Loop checkpoint — waiting for approval…")
        # Wait for approval (up to 5 minutes)
        for _ in range(300):
            if agent.get("approved") is True:
                _log(agent_id, "✅ Approved — resuming execution")
                break
            if agent.get("approved") is False:
                agent["status"] = "cancelled"
                agent["updated_at"] = datetime.utcnow().isoformat()
                _log(agent_id, "🛑 Execution cancelled by operator")
                return
            await asyncio.sleep(1)
        else:
            agent["status"] = "failed"
            _log(agent_id, "⚠️ Approval timeout — aborting")
            return

    agent["status"] = "running"
    agent["updated_at"] = datetime.utcnow().isoformat()

    # Simulate parallel agent work
    tasks = [
        ("🔍", "Gathering context and analysing requirements"),
        ("⚙️", "Executing primary task steps"),
        ("🔗", "Aggregating sub-agent results"),
        ("🛡️", "Running validation and self-healing checks"),
    ]
    for icon, step in tasks:
        _log(agent_id, f"{icon} {step}…")
        await asyncio.sleep(1.5)

    # --- Complete ---
    agent["status"] = "completed"
    agent["updated_at"] = datetime.utcnow().isoformat()
    agent["result"] = f"Successfully completed: {request.objective}"
    _log(agent_id, "🎉 Task completed successfully!")
    _log(agent_id, f"📊 Total tokens used: ~{2500 + len(request.objective) * 10}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check():
    """Liveness probe — used by the frontend to verify the backend is running."""
    return {"status": "ok", "version": "1.0.0", "agents": len(_agents)}


@app.get("/api/agents")
async def list_agents():
    """Return all agents ordered by creation time (newest first)."""
    agents = sorted(_agents.values(), key=lambda a: a["created_at"], reverse=True)
    return {"agents": agents}


@app.post("/api/agents", status_code=201)
async def create_agent(
    request: CreateAgentRequest,
    background_tasks: BackgroundTasks,
):
    """Create a new Hive agent task and start it in the background."""
    agent_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    agent = {
        "id": agent_id,
        "objective": request.objective,
        "model": request.model,
        "provider": request.provider,
        "max_agents": request.max_agents,
        "human_in_loop": request.human_in_loop,
        "status": "initialising",
        "created_at": now,
        "updated_at": now,
        "result": None,
        "approved": None,
    }

    _agents[agent_id] = agent
    _logs[agent_id] = []

    background_tasks.add_task(_run_hive_agent, agent_id, request)
    return agent


@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get a single agent's full status."""
    agent = _agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@app.post("/api/agents/{agent_id}/approve")
async def approve_agent(agent_id: str, body: ApproveAgentRequest):
    """Human-in-the-loop approval or rejection of a paused agent."""
    agent = _agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent["status"] != "awaiting_approval":
        raise HTTPException(status_code=400, detail="Agent is not awaiting approval")

    agent["approved"] = body.approved
    action = "approved" if body.approved else "rejected"
    _log(agent_id, f"👤 Operator {action}" + (f": {body.message}" if body.message else ""))
    return {"ok": True, "action": action}


@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Remove an agent from the registry."""
    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    _agents.pop(agent_id, None)
    _logs.pop(agent_id, None)
    return {"ok": True}


@app.get("/api/agents/{agent_id}/logs")
async def stream_logs(agent_id: str, since: int = 0):
    """
    Server-Sent Events stream of agent log lines.
    `since` is the index of the last log line already seen by the client.
    """
    if agent_id not in _agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    async def _event_generator() -> AsyncGenerator[str, None]:
        cursor = since
        while True:
            lines = _logs.get(agent_id, [])
            if cursor < len(lines):
                for line in lines[cursor:]:
                    data = json.dumps({"line": line, "index": cursor})
                    yield f"data: {data}\n\n"
                    cursor += 1

            agent = _agents.get(agent_id, {})
            if agent.get("status") in ("completed", "failed", "cancelled"):
                yield f"data: {json.dumps({'done': True})}\n\n"
                break

            await asyncio.sleep(0.5)

    return StreamingResponse(
        _event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Dev entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("hive_api:app", host="0.0.0.0", port=7433, reload=True)
