# AI CA Agent: Memory-Powered OS for Chartered Accountants

## The Problem
Chartered Accountants manage dozens of clients and waste hours digging through old PDFs, Form 16s, and email threads to remember past tax regimes, deductions, and financial history. Traditional LLM chatbots are stateless and quickly forget context, leading to hallucinations or generic advice.

## The Solution
We built an **AI CA Agent** powered by a persistent memory system (simulating Vectorize Hindsight). Instead of a generic chatbot, this agent has a permanent, transparent memory bank for every single client. It automatically extracts facts from uploaded tax documents and seamlessly injects them into the advisory workflow.

## Key Features
- **Multi-Agent Orchestration**: A smart router decides exactly which agents (Advisory, Document, Anomaly) and which memory namespaces (tax_history, deductions, etc.) are needed for any given query.
- **Persistent Hindsight Memory**: Facts extracted from documents (like Gross Salary from a Form 16) are permanently stored in the client's memory vector graph.
- **Document Extraction Agent**: Automatically parses uploaded PDFs (like Form 16), extracts critical financial metrics using PyMuPDF, and writes them back to the memory graph.
- **Real-Time Memory Audit UI**: A sleek, reactive dashboard that lets CAs peek into the AI's "brain" to see exactly what facts it has learned and when.
- **Enterprise Observability**: Fully instrumented with **LangSmith** (`@traceable`) to provide real-time visualization of agent handoffs, latency, and prompt traces.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: FastAPI, Python
- **AI/LLM**: Groq API (`llama-3.3-70b-versatile`)
- **Tracing**: LangSmith
- **Document Parsing**: PyMuPDF (`fitz`)

## Quick Setup

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=ai-ca-agent
```

Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo Flow
1. **Audit the Memory**: Open the Memory Audit tab to view existing client facts (e.g., Ramesh Iyer).
2. **Query the Agent**: Ask the Advisory Agent a contextual question. Watch LangSmith trace the memory retrieval and synthesis in real-time.
3. **Upload a Document**: Upload a Form 16 PDF. The Document Agent extracts facts and writes them to memory.
4. **Watch it Learn**: Flip back to the Audit tab and see the newly learned facts appear instantly, demonstrating actual AI learning and memory persistence.
