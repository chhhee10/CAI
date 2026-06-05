import os, httpx, json
import sys

# Add backend directory to path if not present
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.mock import mock_retain, mock_recall, mock_mental_model_retrieve, mock_delete_entry
from langsmith import traceable

async def retain(key: str, value: dict) -> None:
    await mock_retain(key, value)

@traceable(run_type="retriever", name="Hindsight Vector Memory")
async def recall(query: str, namespace: str = "", top_k: int = 5) -> list[dict]:
    return await mock_recall(query, namespace, top_k)

async def mental_model_retrieve(client_id: str) -> dict:
    return await mock_mental_model_retrieve(client_id)

async def delete_entry(key: str) -> None:
    await mock_delete_entry(key)
