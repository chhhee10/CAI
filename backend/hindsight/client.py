import os, json, asyncio, re
import sys

# Add backend directory to path if not present
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from langsmith import traceable
from hindsight_client import Hindsight
from dotenv import load_dotenv

load_dotenv()

# Base URL for Vectorize Hindsight API. Defaulting to standard cloud host if not specified.
BASE_URL = os.environ.get("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io")
API_KEY = os.environ.get("HINDSIGHT_API_KEY")
BANK_ID = "HWD"

try:
    hindsight = Hindsight(base_url=BASE_URL, api_key=API_KEY)
except Exception as e:
    print(f"Failed to initialize Hindsight SDK: {e}")
    hindsight = None

async def retain(key: str, value: dict) -> None:
    if not hindsight:
        return
    try:
        content = json.dumps({"key": key, "value": value})
        client_id = key.split(':')[1] if len(key.split(':')) > 1 else "unknown"
        await hindsight.aretain(
            bank_id=BANK_ID,
            content=content,
            tags=[client_id]
        )
    except Exception as e:
        print(f"Error retaining memory in cloud: {e}")

@traceable(run_type="retriever", name="Hindsight Vector Memory")
async def recall(query: str, namespace: str = "", top_k: int = 5) -> list[dict]:
    if not hindsight:
        return []
    try:
        search_query = f"{namespace} {query}".strip()
        client_id = namespace.split(':')[1] if len(namespace.split(':')) > 1 else None
        
        kwargs = {
            "bank_id": BANK_ID,
            "query": search_query
        }
        if client_id:
            kwargs["tags"] = [client_id]
            kwargs["tags_match"] = "all_strict"
            
        results = await hindsight.arecall(**kwargs)
        parsed_results = []
        
        # AY regex: matches AY2022-23, AY2023-24, AY2024-25 etc.
        _AY_RE = re.compile(r"AY\s*(\d{4}-\d{2,4})", re.IGNORECASE)
        # Map AY string to a sortable integer (e.g. "2024-25" → 202425)
        def _ay_sort_key(ay_str: str) -> int:
            if not ay_str:
                return 0
            digits = re.sub(r"[^\d]", "", ay_str)
            return int(digits) if digits else 0

        items = getattr(results, "items", results)
        if hasattr(items, '__iter__'):
            for i, r in enumerate(items):
                text_val = getattr(r, "text", getattr(r, "content", str(r)))
                
                actual_fact = text_val
                
                # Extract confidence from tags (e.g. conf_95)
                confidence = 72
                tags = getattr(r, "tags", [])
                for t in tags:
                    if isinstance(t, str) and t.startswith("conf_"):
                        try:
                            confidence = int(t.split("_")[1])
                        except ValueError:
                            pass
                
                # Categorise by content keywords
                fake_key_type = "fact"
                text_lower = actual_fact.lower()
                if "notice" in text_lower or "deadline" in text_lower or "scrutiny" in text_lower or "mismatch" in text_lower:
                    fake_key_type = "notices"
                elif "deduction" in text_lower or "80c" in text_lower or "80d" in text_lower or "ppf" in text_lower or "nps" in text_lower or "hra" in text_lower:
                    fake_key_type = "deductions"
                elif "income" in text_lower or "salary" in text_lower or "freelance" in text_lower or "rental" in text_lower or "capital gain" in text_lower:
                    fake_key_type = "income"
                elif "prefer" in text_lower or "regime" in text_lower or "risk" in text_lower or "whatsapp" in text_lower or "email" in text_lower:
                    fake_key_type = "preferences"
                elif "tax" in text_lower or "gross" in text_lower or "refund" in text_lower or "advance tax" in text_lower:
                    fake_key_type = "tax_history"

                # Extract the most recent AY mentioned in this fact
                ay_matches = _AY_RE.findall(actual_fact)
                ay_label = ay_matches[-1] if ay_matches else ""
                ay_sort  = _ay_sort_key(ay_label)

                parsed_results.append({
                    "key": f"{namespace}:{fake_key_type}:{i}",
                    "value": {"fact": actual_fact, "confidence": confidence},
                    "ay": ay_label,
                    "ay_sort": ay_sort,
                    "order": i
                })
        
        print(f"DEBUG: parsed_results length: {len(parsed_results)}")
        return parsed_results[:top_k]
    except Exception as e:
        import traceback
        print(f"Error recalling memory from cloud: {e}")
        traceback.print_exc()
        return []

async def mental_model_retrieve(client_id: str) -> dict:
    if not hindsight:
        return {}
    try:
        models = await asyncio.to_thread(
            hindsight.list_mental_models,
            bank_id=BANK_ID
        )
        items = getattr(models, "items", models)
        if hasattr(items, '__iter__'):
            for m in items:
                name = getattr(m, "name", "")
                content = getattr(m, "content", "")
                if client_id in name or client_id in content:
                    return {"model": content}
        return {}
    except Exception as e:
        print(f"Error retrieving mental model from cloud: {e}")
        return {}

async def delete_entry(key: str) -> None:
    print(f"Delete operations are currently handled via the Hindsight Dashboard for: {key}")
