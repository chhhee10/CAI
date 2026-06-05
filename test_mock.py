import asyncio
from backend.utils.mock import mock_retain, mock_recall, MOCK_MEMORY

async def test():
    print("Before:", len(MOCK_MEMORY["abcri1234d"]["tax_history"]))
    await mock_retain("client:abcri1234d:tax_history:ay2425", {"gross": 1850000, "tds": 310000, "verified": "form16"})
    print("After:", len(MOCK_MEMORY["abcri1234d"]["tax_history"]))
    
    results = await mock_recall("", "client:abcri1234d")
    print("Total recalled:", len(results))
    print("Contains new?", any(r["key"] == "client:abcri1234d:tax_history:ay2425" for r in results))

asyncio.run(test())
