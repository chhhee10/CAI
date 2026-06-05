import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure backend directory is in path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from hindsight.client import retain
from hindsight.keys import *

CLIENTS = [
    {
        "id": "abcri1234d",
        "name": "Ramesh Iyer",
        "pan": "ABCRI1234D",
        "data": [
            (tax_history("abcri1234d", "ay2122"), {"fact": "July 2022: Received Form 16 from Infosys. Gross salary was ₹15,20,000 with ₹2,40,000 paid in TDS. Received a tax refund of ₹8,000."}),
            (tax_history("abcri1234d", "ay2223"), {"fact": "July 2023: Received Form 16 from Infosys. Gross salary increased to ₹16,80,000 with ₹2,85,000 paid in TDS. Received a tax refund of ₹11,000."}),
            (tax_history("abcri1234d", "ay2324"), {"fact": "July 2024: Received Form 16 from Infosys. Gross salary was ₹18,40,000 with ₹3,20,000 paid in TDS. Received a tax refund of ₹12,000."}),
            (income("abcri1234d", "salary", "ay2324"), {"fact": "Currently employed at Infosys with a stable annual compensation of ₹18,40,000."}),
            (income("abcri1234d", "house_property", "ay2425"), {"fact": "March 2025: Purchased a new 2BHK flat in Whitefield, Bangalore. Started paying a home loan EMI of ₹38,000 per month."}),
            (deduction("abcri1234d", "80c", "ay2324"), {"fact": "May 2024: Maxed out the Section 80C limit by investing ₹1,50,000 into an SBI Life Insurance policy."}),
            (deduction("abcri1234d", "80d", "ay2324"), {"fact": "August 2024: Purchased a family health insurance policy, claiming a ₹25,000 deduction under Section 80D."}),
            (notice("abcri1234d", "n001"), {"fact": "November 2024: Received an open 143(1) intimation notice for Assessment Year 2024-25. The deadline to respond is June 18, 2025."}),
            (preference("abcri1234d", "regime"), {"fact": "April 2025: Switched to the Old Tax Regime to maximize Section 24(b) deductions on the new home loan."}),
            (preference("abcri1234d", "risk"), {"fact": "Client profile indicates a low risk tolerance and a preference for formal communication regarding financial matters."}),
            (income("abcri1234d", "monthly_cash_avg", "ay2324"), {"fact": "Maintains an average monthly bank deposit of ₹80,000 based on a 12-month sample."}),
        ]
    },
    {
        "id": "bcdps5678e",
        "name": "Priya Sharma",
        "pan": "BCDPS5678E",
        "data": [
            (tax_history("bcdps5678e", "ay2223"), {"fact": "July 2023: Received Form 16 from TCS. Gross salary was ₹9,80,000. Paid ₹95,000 in taxes with a ₹3,000 refund."}),
            (tax_history("bcdps5678e", "ay2324"), {"fact": "July 2024: Received Form 16 from TCS. Gross salary grew to ₹1,12,000. Paid ₹1,30,000 in taxes with a ₹5,000 refund."}),
            (deduction("bcdps5678e", "80c", "ay2324"), {"fact": "March 2024: Invested ₹1,20,000 into a PPF account. Did not fully max out the Section 80C limit."}),
            (preference("bcdps5678e", "regime"), {"fact": "Consistently prefers the New Tax Regime due to simpler filing and lack of major investments."}),
        ]
    },
    {
        "id": "cdemk9012f",
        "name": "MK Traders",
        "pan": "CDEMK9012F",
        "data": [
            (tax_history("cdemk9012f", "ay2324"), {"fact": "March 2024: GST filed successfully. Total business turnover was ₹45,00,000 with a net profit of ₹3,80,000. Paid ₹85,000 in advance tax."}),
            (notice("cdemk9012f", "n001"), {"fact": "January 2025: Received a GST scrutiny notice. Case is currently open with a deadline of July 10, 2025."}),
        ]
    },
    {
        "id": "newclient000",
        "name": "New Client",
        "pan": "ZZZXX0000Z",
        "data": []
    }
]

# Cross-client pattern
CROSS_CLIENT = [
    (cross_client_pattern("regime_15l_25l_homeloan"), {"fact": "Cross-client analysis shows that 83% of clients in the ₹15L-₹25L bracket with an active home loan prefer the Old Tax Regime. Sample size: 47 clients."}),
    (cross_client_pattern("advance_tax_miss_rate"), {"fact": "Anomaly detection indicates a 34% missed advance tax payment rate in Q1 for clients in the ₹10L-₹20L bracket. Sample size: 89 clients."}),
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
