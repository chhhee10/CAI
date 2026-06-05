from datetime import datetime, date
from hindsight.client import recall
from hindsight.keys import notice

async def get_notices(client_id: str) -> dict:
    results = await recall("notice deadline reply", namespace=f"client:{client_id}:notices")
    notices = [r for r in results]

    today = date.today()
    for n in notices:
        v = n.get("value", {})
        if v.get("deadline"):
            deadline = datetime.strptime(v["deadline"], "%Y-%m-%d").date()
            days_left = (deadline - today).days
            v["days_left"] = days_left
            v["urgency"] = "high" if days_left <= 14 else "normal" if days_left <= 30 else "low"

    open_notices = [n for n in notices if n.get("value", {}).get("status") == "open"]
    closed_notices = [n for n in notices if n.get("value", {}).get("status") == "closed"]

    return {"open": open_notices, "closed": closed_notices}
