import fitz  # PyMuPDF
import re
from hindsight.client import retain
from hindsight.keys import tax_history, income, deduction
from langsmith import traceable

CLIENT_NAMES = {
    "abcri1234d": "Ramesh Iyer",
    "bcdps5678e": "Priya Sharma",
    "cdemk9012f": "MK Traders",
    "newclient000": "New Client"
}

@traceable(run_type="tool", name="Document Extraction Agent")
def extract_form16(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)
    text = "\n".join(page.get_text() for page in doc)

    # Regex extractors — extend as needed
    gross = re.search(r"Gross Salary[^\d]*([\d,]+)", text)
    tds = re.search(r"Total Tax Deducted[^\d]*([\d,]+)", text)
    pan = re.search(r"PAN\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])", text)

    return {
        "gross": int(gross.group(1).replace(",", "")) if gross else None,
        "tds": int(tds.group(1).replace(",", "")) if tds else None,
        "pan": pan.group(1) if pan else None,
        "raw_text": text[:2000]  # keep first 2000 chars for advisory context
    }

async def ingest_and_store(pdf_path: str, client_id: str, ay: str) -> dict:
    facts = extract_form16(pdf_path)
    client_name = CLIENT_NAMES.get(client_id, "the client")
    
    if facts["gross"]:
        fact_str = f"Form 16 uploaded for {client_name}. Gross salary verified at ₹{int(facts['gross']):,} with ₹{int(facts['tds']):,} paid in TDS."
        await retain(
            tax_history(client_id, ay),
            {"fact": fact_str}
        )
    return facts
