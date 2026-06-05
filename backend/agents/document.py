import fitz  # PyMuPDF
import re
from hindsight.client import retain
from hindsight.keys import tax_history, income, deduction
from langsmith import traceable

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
    if facts["gross"]:
        await retain(
            tax_history(client_id, ay),
            {"gross": facts["gross"], "tds": facts["tds"], "verified": "form16"}
        )
        await retain(
            income(client_id, "salary", ay),
            {"amount": facts["gross"], "source": "form16"}
        )
    return facts
