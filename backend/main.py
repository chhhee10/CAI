from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.orchestrator import route
from agents.advisory import synthesise
from agents.document import ingest_and_store
from agents.notice import get_notices
from agents.yoy import compare
from hindsight.client import recall, retain, delete_entry, mental_model_retrieve

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*"], # Also allow generic to avoid issues
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    client_id: str
    query: str

@app.post("/query")
async def handle_query(req: QueryRequest):
    # Step 1 — fetch client mental model (cheap op)
    memory = await mental_model_retrieve(req.client_id)
    client_summary = str(memory)[:500]

    # Step 2 — route (LLM call #1)
    routing = await route(req.query, client_summary)

    # Step 3 — fetch relevant namespaces
    context_parts = []
    for ns in routing.get("context_needed", []):
        results = await recall(req.query, namespace=f"client:{req.client_id}:{ns}")
        context_parts.extend(results)

    memory_context = "\n".join(str(r) for r in context_parts)

    # Step 4 — advisory synthesis (LLM call #2)
    response = await synthesise(req.query, memory_context, "", "")

    return {"response": response, "routing": routing, "memory_used": len(context_parts)}

@app.post("/upload/{client_id}/{ay}")
async def upload_document(client_id: str, ay: str, file: UploadFile = File(...)):
    path = f"/tmp/{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())
    facts = await ingest_and_store(path, client_id, ay)
    return {"extracted": facts, "stored": True}

@app.get("/clients")
async def get_clients():
    import json
    import os
    base_clients = []
    
    kb_path = os.path.join(os.path.dirname(__file__), "..", "NewKB", "hindsight_kb.json")
    try:
        with open(kb_path, "r") as f:
            kb_data = json.load(f)
            for c in kb_data.get("clients", []):
                base_clients.append({
                    "id": c["id"].lower(),
                    "name": c["name"],
                    "pan": c["id"].upper()
                })
    except Exception as e:
        print(f"Error loading NewKB: {e}")
        # Fallback to empty if it fails
        pass

    base_clients.append({"id": "newclient000", "name": "New Client", "pan": "ZZZXX0000Z"})
    
    for c in base_clients:
        if c["id"] != "newclient000":
            results = await recall(
                "tax income deductions notice preferences regime salary GST advance",
                namespace=f"client:{c['id']}",
                top_k=60
            )
            c["entries"] = len(results)
            ays = set()
            for r in results:
                if "ay" in r and r["ay"]:
                    ays.add(r["ay"])
            c["years"] = len(ays)
        else:
            c["entries"] = 0
            c["years"] = 0
            
    return base_clients

@app.get("/notices/{client_id}")
async def notices(client_id: str):
    return await get_notices(client_id)

@app.get("/yoy/{client_id}/{ay_current}/{ay_previous}")
async def yoy(client_id: str, ay_current: str, ay_previous: str):
    return await compare(client_id, ay_current, ay_previous)

@app.get("/memory/{client_id}")
async def get_memory(client_id: str):
    # Use a broad query covering all fact types so Hindsight ranks relevant results
    results = await recall(
        "tax income deductions notice preferences regime salary GST advance",
        namespace=f"client:{client_id}",
        top_k=60
    )
    return {"entries": results, "total": len(results)}

@app.delete("/memory/{key:path}")
async def delete_memory(key: str):
    await delete_entry(key)
    return {"deleted": key}
