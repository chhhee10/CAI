import asyncio
import os
import sys

# Ensure backend directory is in path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from hindsight.client import retain
from hindsight.keys import *

CLIENTS = [
    {
        "id": "abcri1234d",
        "name": "Ramesh Iyer",
        "pan": "ABCRI1234D",
        "data": [
            # Tax history — 3 years
            (tax_history("abcri1234d", "ay2122"), {"gross": 1520000, "employer": "infosys", "tax_paid": 240000, "refund": 8000, "verified": "form16"}),
            (tax_history("abcri1234d", "ay2223"), {"gross": 1680000, "employer": "infosys", "tax_paid": 285000, "refund": 11000, "verified": "form16"}),
            (tax_history("abcri1234d", "ay2324"), {"gross": 1840000, "employer": "infosys", "tax_paid": 320000, "refund": 12000, "verified": "form16"}),
            # Income
            (income("abcri1234d", "salary", "ay2324"), {"amount": 1840000, "employer": "infosys"}),
            (income("abcri1234d", "house_property", "ay2425"), {"flat": "whitefield", "emi": 38000, "purchased": "2025-03"}),
            # Deductions
            (deduction("abcri1234d", "80c", "ay2324"), {"amount": 150000, "instrument": "sbi_life", "maxed": True}),
            (deduction("abcri1234d", "80d", "ay2324"), {"amount": 25000, "instrument": "health_insurance"}),
            # Notices
            (notice("abcri1234d", "n001"), {"date": "2024-11-15", "type": "143(1)", "ay": "2024-25", "status": "open", "deadline": "2025-06-18"}),
            # Preferences
            (preference("abcri1234d", "regime"), {"regime": "old", "reason": "home_loan_benefit"}),
            (preference("abcri1234d", "risk"), {"risk": "low", "comm_style": "formal"}),
            # Monthly cash baseline for anomaly detection
            (income("abcri1234d", "monthly_cash_avg", "ay2324"), {"avg_monthly_deposit": 80000, "months_sampled": 12}),
        ]
    },
    {
        "id": "bcdps5678e",
        "name": "Priya Sharma",
        "pan": "BCDPS5678E",
        "data": [
            (tax_history("bcdps5678e", "ay2223"), {"gross": 980000, "employer": "tcs", "tax_paid": 95000, "refund": 3000, "verified": "form16"}),
            (tax_history("bcdps5678e", "ay2324"), {"gross": 1120000, "employer": "tcs", "tax_paid": 130000, "refund": 5000, "verified": "form16"}),
            (deduction("bcdps5678e", "80c", "ay2324"), {"amount": 120000, "instrument": "ppf", "maxed": False}),
            (preference("bcdps5678e", "regime"), {"regime": "new", "reason": "simpler_filing"}),
        ]
    },
    {
        "id": "cdemk9012f",
        "name": "MK Traders",
        "pan": "CDEMK9012F",
        "data": [
            (tax_history("cdemk9012f", "ay2324"), {"turnover": 4500000, "profit": 380000, "gst_filed": True, "advance_tax_paid": 85000}),
            (notice("cdemk9012f", "n001"), {"date": "2025-01-10", "type": "GST_scrutiny", "ay": "2024-25", "status": "open", "deadline": "2025-07-10"}),
        ]
    },
    # New client — zero history — for before/after demo
    {
        "id": "newclient000",
        "name": "New Client",
        "pan": "ZZZXX0000Z",
        "data": []
    }
]

# Cross-client pattern
CROSS_CLIENT = [
    (cross_client_pattern("regime_15l_25l_homeloan"), {"bracket": "15L-25L", "home_loan": True, "old_regime_pct": 83, "sample_size": 47}),
    (cross_client_pattern("advance_tax_miss_rate"), {"missed_q1_pct": 34, "bracket": "10L-20L", "sample_size": 89}),
]

async def seed():
    if not os.environ.get("HINDSIGHT_API_KEY"):
        print("Error: HINDSIGHT_API_KEY not set in environment.")
        return

    print("Seeding synthetic clients into Hindsight...")
    for client in CLIENTS:
        for key, value in client["data"]:
            await retain(key, value)
            print(f"  ✓ {key}")
    for key, value in CROSS_CLIENT:
        await retain(key, value)
        print(f"  ✓ {key}")
    print("Done.")

if __name__ == "__main__":
    asyncio.run(seed())
