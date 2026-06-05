import os
from fpdf import FPDF

CLIENTS = [
    {"id": "abcri1234d", "name": "Ramesh Iyer", "pan": "ABCRI1234D", "gross": "1,950,000", "tds": "340,000", "ay": "2025-26"},
    {"id": "bcdps5678e", "name": "Priya Sharma", "pan": "BCDPS5678E", "gross": "1,250,000", "tds": "145,000", "ay": "2025-26"},
    {"id": "cdemk9012f", "name": "MK Traders", "pan": "CDEMK9012F", "gross": "4,800,000", "tds": "90,000", "ay": "2025-26"}
]

def create_pdf(client):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    
    # Header
    pdf.cell(200, 10, txt="FORM 16", ln=True, align='C')
    pdf.set_font("Arial", '', 12)
    pdf.cell(200, 10, txt="Certificate under section 203 of the Income-tax Act, 1961", ln=True, align='C')
    pdf.line(10, 30, 200, 30)
    pdf.ln(10)
    
    # Client Details
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(50, 10, txt="Name of Employee:", ln=False)
    pdf.set_font("Arial", '', 12)
    pdf.cell(150, 10, txt=client['name'], ln=True)
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(50, 10, txt="PAN:", ln=False)
    pdf.set_font("Arial", '', 12)
    pdf.cell(150, 10, txt=client['pan'], ln=True)
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(50, 10, txt="Assessment Year:", ln=False)
    pdf.set_font("Arial", '', 12)
    pdf.cell(150, 10, txt=client['ay'], ln=True)
    
    pdf.ln(10)
    pdf.line(10, 70, 200, 70)
    pdf.ln(5)
    
    # Financials
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="Part A & B Summary", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(100, 10, txt="Gross Salary", ln=False)
    pdf.set_font("Arial", '', 12)
    pdf.cell(100, 10, txt=f"Rs. {client['gross']}", ln=True)
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(100, 10, txt="Total Tax Deducted", ln=False)
    pdf.set_font("Arial", '', 12)
    pdf.cell(100, 10, txt=f"Rs. {client['tds']}", ln=True)
    
    pdf.ln(20)
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(200, 10, txt="This is a computer generated document.", ln=True, align='C')
    
    # Save PDF
    os.makedirs("demo_docs", exist_ok=True)
    filename = f"demo_docs/Form16_{client['name'].replace(' ', '_')}_{client['ay']}.pdf"
    pdf.output(filename)
    print(f"Generated {filename}")

if __name__ == "__main__":
    for client in CLIENTS:
        create_pdf(client)
