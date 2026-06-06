import re
from datetime import datetime, date
from hindsight.client import recall

# Known notice keywords to extract a human-readable notice type
_NOTICE_TYPE_PATTERNS = [
    (r"section\s*148", "Section 148 – Income Escapement"),
    (r"section\s*143\s*\(1\)", "Section 143(1) – Intimation / Demand"),
    (r"scrutiny\s*notice", "Scrutiny Notice"),
    (r"26as\s*mismatch", "26AS Mismatch"),
    (r"gst\s*notice|itc\s*mismatch", "GST / ITC Mismatch"),
    (r"cash\s*deposit\s*flagged|anomaly", "Cash Deposit Anomaly"),
    (r"form\s*16\s*pending", "Form 16 Pending"),
]

# Deadline extraction — covers formats like "18 June 2025", "30 Jun 2025", "2025-06-18"
_DEADLINE_RE = re.compile(
    r"(?:deadline|due|reply\s+(?:by|deadline)|due\s+by)[:\s]+(\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2})",
    re.IGNORECASE
)

# AY extraction — e.g. "AY2023-24", "AY 2024-25"
_AY_RE = re.compile(r"AY\s*(\d{4}-\d{2,4})", re.IGNORECASE)

# Status signals
_CLOSED_SIGNALS = re.compile(
    r"\b(closed|dropped|no\s+further\s+action|no\s+pending|paid|clean|resolved|dropped\s+in\s+february)\b",
    re.IGNORECASE
)
_OPEN_SIGNALS = re.compile(
    r"\b(open|pending|status\s+is\s+open|reply\s+deadline|due|awaiting)\b",
    re.IGNORECASE
)


def _parse_deadline(text: str):
    """Try to extract and parse a deadline date from text. Returns (date_obj, str) or (None, None)."""
    m = _DEADLINE_RE.search(text)
    if not m:
        return None, None
    raw = m.group(1).strip()
    for fmt in ("%d %B %Y", "%d %b %Y", "%Y-%m-%d"):
        try:
            d = datetime.strptime(raw, fmt).date()
            return d, d.strftime("%d %b %Y")
        except ValueError:
            continue
    return None, raw


def _classify_notice(text: str):
    """Extract structured notice fields from plain-text fact string."""
    text_lower = text.lower()

    # Notice type
    notice_type = "Tax Notice"
    for pattern, label in _NOTICE_TYPE_PATTERNS:
        if re.search(pattern, text_lower):
            notice_type = label
            break

    # AY
    ay_match = _AY_RE.search(text)
    ay = ay_match.group(1) if ay_match else "—"

    # Status: prefer explicit signals; default open for notices
    is_closed = bool(_CLOSED_SIGNALS.search(text)) and not bool(_OPEN_SIGNALS.search(text))
    status = "closed" if is_closed else "open"

    # Deadline
    deadline_date, deadline_str = _parse_deadline(text)
    days_left = None
    urgency = "low"
    if deadline_date and status == "open":
        days_left = (deadline_date - date.today()).days
        urgency = "high" if days_left <= 14 else "normal" if days_left <= 30 else "low"

    return {
        "type": notice_type,
        "ay": ay,
        "status": status,
        "deadline": deadline_str,
        "days_left": days_left,
        "urgency": urgency,
        "raw": text,   # Pass the full text to the frontend so it can show it
    }


async def get_notices(client_id: str) -> dict:
    """Recall notice facts from Hindsight and return structured open/closed lists."""
    results = await recall(
        "notice deadline reply open pending scrutiny GST mismatch flagged",
        namespace=f"client:{client_id}:notices",
        top_k=10
    )

    open_notices = []
    closed_notices = []

    for r in results:
        # The fact text lives in r["value"]["fact"]
        val = r.get("value", {})
        raw_text = val.get("fact", "") if isinstance(val, dict) else str(val)
        if not raw_text:
            continue

        parsed = _classify_notice(raw_text)

        entry = {
            "key": r.get("key", ""),
            "value": parsed
        }

        if parsed["status"] == "closed":
            closed_notices.append(entry)
        else:
            open_notices.append(entry)

    # Sort open notices by urgency: high → normal → low
    urgency_order = {"high": 0, "normal": 1, "low": 2}
    open_notices.sort(key=lambda n: urgency_order.get(n["value"]["urgency"], 3))

    return {"open": open_notices, "closed": closed_notices}
