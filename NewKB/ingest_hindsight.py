"""
Hindsight KB Ingestion Script
------------------------------
Reads hindsight_kb.json and pushes every fact into Hindsight Cloud
using the SDK's aretain() method with the HWD bank_id and client tags.

Key structure stored:
  content : "key: client:{client_id_lower}:{namespace}:{index} | value: {fact_text}"
  tags    : [client_id_lower]  — enables per-client isolation on recall

Usage:
  cd ai-ca-agent/NewKB
  source ../backend/venv/bin/activate
  python ingest_hindsight.py
"""

import asyncio, json, os, sys, time
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(env_path)

API_KEY  = os.environ.get("HINDSIGHT_API_KEY", "")
BASE_URL = os.environ.get("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io")
BANK_ID  = "HWD"

if not API_KEY:
    print("ERROR: HINDSIGHT_API_KEY not found. Check backend/.env")
    sys.exit(1)

from hindsight_client import Hindsight

KB_PATH = Path(__file__).parent / "hindsight_kb.json"

async def ingest():
    hindsight = Hindsight(base_url=BASE_URL, api_key=API_KEY)

    with open(KB_PATH) as f:
        kb = json.load(f)

    total = 0
    for client in kb["clients"]:
        cid   = client["id"]
        cname = client["name"]
        ns_counters = {}
        print(f"\n▶  Ingesting {cname} ({cid}) — {len(client['facts'])} facts")

        for fact in client["facts"]:
            ns  = fact["namespace"]
            idx = ns_counters.get(ns, 0)
            ns_counters[ns] = idx + 1

            key     = f"client:{cid.lower()}:{ns}:{idx}"
            content = f"key: {key} | value: {fact['fact']}"
            conf    = fact.get("confidence", 72)
            tags    = [cid.lower(), f"conf_{conf}"]

            try:
                await hindsight.aretain(
                    bank_id=BANK_ID,
                    content=content,
                    tags=tags
                )
                print(f"  ✓  {key}")
            except Exception as e:
                print(f"  ✗  {key}  → {e}")

            total += 1
            time.sleep(0.15)   # gentle rate limiting

    print(f"\nDone — {total} facts ingested across {len(kb['clients'])} clients.")

    # Close aiohttp session gracefully
    try:
        await hindsight._client.aclose()
    except Exception:
        pass

if __name__ == "__main__":
    asyncio.run(ingest())
