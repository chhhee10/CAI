from hindsight.client import recall

async def compare(client_id: str, ay_current: str, ay_previous: str) -> dict:
    current = await recall("tax income salary", namespace=f"client:{client_id}:tax_history", top_k=3)
    previous = await recall("tax income salary", namespace=f"client:{client_id}:tax_history", top_k=3)

    # Parse and diff — return structured delta
    def find_ay(results, ay):
        for r in results:
            if ay in r.get("key", ""):
                return r.get("value", {})
        return {}

    curr = find_ay(current, ay_current)
    prev = find_ay(previous, ay_previous)

    if not curr or not prev:
        return {"error": "Insufficient history for YoY comparison"}

    return {
        "gross_delta": curr.get("gross", 0) - prev.get("gross", 0),
        "tax_delta": curr.get("tax_paid", 0) - prev.get("tax_paid", 0),
        "refund_delta": curr.get("refund", 0) - prev.get("refund", 0),
        "current": curr,
        "previous": prev
    }
