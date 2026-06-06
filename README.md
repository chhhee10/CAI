# CAI

CAI is an AI-powered Chartered Accountant assistant that combines a FastAPI backend, a React/Vite frontend, Groq-hosted LLM calls, LangSmith tracing, PDF extraction, and a simulated Vectorize Hindsight memory layer. The project is designed as a working demo of how a CA can ask client-specific tax questions, inspect the exact memory used by the assistant, upload Form 16 documents, and track notices or compliance deadlines.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Problem](#core-problem)
3. [Solution](#solution)
4. [Key Features](#key-features)
5. [Architecture](#architecture)
6. [Agent Workflow](#agent-workflow)
7. [Model Usage and Numbers](#model-usage-and-numbers)
8. [Hindsight Memory Usage and Numbers](#hindsight-memory-usage-and-numbers)
9. [Seeded Demo Data](#seeded-demo-data)
10. [Backend API](#backend-api)
11. [Frontend UI](#frontend-ui)
12. [Tech Stack](#tech-stack)
13. [Setup](#setup)
14. [Demo Flow](#demo-flow)
15. [Project Structure](#project-structure)
16. [Environment Variables](#environment-variables)
17. [Current Limitations](#current-limitations)

## Project Overview

CAI acts like a memory-aware operating layer for Chartered Accountants. Instead of treating every chat message as an isolated request, the backend first retrieves a client's stored financial memory, routes the question to the right agent path, fetches only the required memory namespaces, and then generates a grounded advisory response.

The frontend exposes this behavior through two primary screens:

1. **Memory Audit**: inspect the stored facts for the selected client.
2. **Advisory Agent**: ask questions, upload PDFs, and receive memory-grounded answers.

## Core Problem

Chartered Accountants often manage many clients across multiple assessment years. Important facts are scattered across Form 16 PDFs, tax filings, notices, deductions, salary history, and past client preferences. A normal chatbot does not remember these facts reliably, so it can produce generic advice or hallucinate missing history.

CAI solves this by making memory visible and queryable. Every client has a namespaced memory bank, and the assistant explicitly retrieves that memory before answering.

## Solution

CAI uses a multi-agent backend with a Hindsight-style memory abstraction.

The query path is:

1. Retrieve the client's mental model from memory.
2. Send the user query and compact client summary to the Orchestrator Agent.
3. Let the Orchestrator choose intent, agents, urgency, and required memory namespaces.
4. Retrieve matching memory entries from Hindsight namespaces.
5. Send the memory context to the Advisory Agent.
6. Return the final response, routing metadata, and memory count to the UI.

## Key Features

- **Memory-first CA assistant**: advice is grounded in stored client facts.
- **Multi-agent routing**: orchestrator chooses between memory, advisory, document, notice, anomaly, and YoY paths.
- **Transparent memory audit**: frontend shows stored facts and namespace categories.
- **Document ingestion**: Form 16 PDFs are parsed with PyMuPDF and regex extractors.
- **Notice tracking**: open and closed notices are separated with deadline-based urgency.
- **YoY comparison**: compares tax, refund, and gross income deltas across assessment years.
- **LangSmith observability**: important chains, retrievers, tools, and LLM calls are traceable.
- **Mock Hindsight mode**: current implementation uses local mock memory, making the app runnable without a live Hindsight service.

## Architecture

```text
frontend/
  React + Vite app
  Calls backend at http://localhost:8000

backend/
  FastAPI app
  Agents for routing, advisory, document parsing, notices, anomaly checks, and YoY comparison
  hindsight/ abstraction for retain, recall, delete, and mental model retrieval
  utils/mock.py in-memory demo store
```

High-level runtime flow:

```text
User
  -> React UI
  -> FastAPI /query
  -> Hindsight mental model retrieval
  -> Groq Orchestrator Agent
  -> Hindsight namespace recall
  -> Groq Advisory Agent
  -> React response bubble
```

## Agent Workflow

### Orchestrator Agent

File: `backend/agents/orchestrator.py`

The Orchestrator is the routing brain. It receives:

- user query
- first 500 characters of the client mental model

It returns XML that is parsed into:

- `intent`
- `client_id`
- `agents`
- `urgency`
- `context_needed`

Supported intents:

- `tax_query`
- `notice`
- `anomaly`
- `advisory`
- `yoy`
- `document`
- `general`

Supported agent names:

- `memory`
- `document`
- `tax_rule`
- `advisory`
- `anomaly`
- `notice`
- `yoy`

### Advisory Agent

File: `backend/agents/advisory.py`

The Advisory Agent receives:

- query
- retrieved memory context
- current document context
- tax rules context

It is instructed to produce:

1. direct answer
2. year-specific advice
3. anomalies or red flags
4. confidence note if memory is older than 9 months

### Document Extraction Agent

File: `backend/agents/document.py`

The Document Agent parses uploaded Form 16 PDFs with PyMuPDF and extracts:

- gross salary
- total tax deducted
- PAN
- raw text preview

When gross salary is found, it writes both tax history and salary income facts back to memory.

### Notice Agent

File: `backend/agents/notice.py`

The Notice Agent retrieves the `notices` namespace, computes `days_left`, and assigns urgency:

- `high` when deadline is in 14 days or less
- `normal` when deadline is in 30 days or less
- `low` when deadline is more than 30 days away

### YoY Agent

File: `backend/agents/yoy.py`

The YoY Agent compares assessment-year entries and returns:

- `gross_delta`
- `tax_delta`
- `refund_delta`
- current year memory
- previous year memory

### Anomaly Agent

File: `backend/agents/anomaly.py`

The Anomaly Agent compares current statement data against a historical baseline and returns either:

- `CLEAR`
- one or more `FLAG: <description> | SEVERITY: high/medium/low` lines

## Model Usage and Numbers

CAI currently uses Groq chat completions for LLM-powered reasoning.

### 1. Normal query path

Each `/query` call uses **2 LLM calls**:

1. **Orchestrator Agent**
   - model: `llama-3.3-70b-versatile`
   - max tokens: `300`
   - temperature: `0`
   - purpose: route query and decide memory namespaces

2. **Advisory Agent**
   - model: `llama-3.3-70b-versatile`
   - max tokens: `1024`
   - temperature: `0.2`
   - response instruction: under `300` words
   - purpose: synthesize final answer from memory context

Total configured output budget for one normal query:

```text
300 + 1024 = 1324 max output tokens
```

### 2. Anomaly model path

The anomaly agent uses:

- model: `qwen/qwen3-32b`
- max tokens: `400`
- purpose: detect unusual transactions or patterns against baseline memory

### 3. Retry behavior

Groq calls are wrapped by `groq_call_with_retry`.

- retries: `3`
- backoff: `2 ** i` seconds
- wait sequence before final failure: `1 second`, then `2 seconds`
- handled exception: `RateLimitError`

### 4. Client summary size

Before routing, the backend converts the client's mental model to text and keeps only:

```text
first 500 characters
```

This keeps the Orchestrator call cheaper and focused on routing.

### 5. Document extraction size

For uploaded PDFs, the document parser stores:

```text
first 2000 characters of extracted raw text
```

This gives enough context for inspection without storing the whole PDF text in the extracted response.

## Hindsight Memory Usage and Numbers

The current Hindsight implementation is a local mock adapter in `backend/utils/mock.py`, exposed through `backend/hindsight/client.py`.

### Memory operations

The backend exposes four memory operations:

- `retain(key, value)`: store or update a fact
- `recall(query, namespace, top_k)`: retrieve facts from a namespace
- `mental_model_retrieve(client_id)`: retrieve the full client memory model
- `delete_entry(key)`: delete interface, currently a no-op in mock mode

### Recall limits

Default recall:

```text
top_k = 5
```

Memory audit endpoint:

```text
top_k = 50
```

YoY comparison:

```text
top_k = 3 for current lookup
top_k = 3 for previous lookup
```

### Namespaces

Client memories are stored using this pattern:

```text
client:{client_id}:{namespace}:{record_id}
```

Supported client namespaces:

- `tax_history`
- `notices`
- `income`
- `deductions`
- `preferences`

Cross-client patterns use:

```text
cross_client:patterns:{pattern_key}
```

### Hindsight keys

Examples:

```text
client:abcri1234d:tax_history:ay2324
client:abcri1234d:deductions:80c_ay2324
client:abcri1234d:income:salary_ay2324
client:abcri1234d:notices:n001
client:abcri1234d:preferences:regime
cross_client:patterns:regime_15l_25l_homeloan
```

### Memory write behavior

In mock mode:

- if a key already exists, `retain` updates the existing value
- if a key is new, `retain` appends a new memory entry
- memory is process-local and resets when the backend restarts

### Current memory counts

The seeded demo clients contain:

| Client | Client ID | PAN | Entries | Years |
| --- | --- | --- | ---: | ---: |
| Ramesh Iyer | `abcri1234d` | `ABCRI1234D` | 11 backend memory entries, 14 shown in sidebar | 3 |
| Priya Sharma | `bcdps5678e` | `BCDPS5678E` | 4 | 2 |
| MK Traders | `cdemk9012f` | `CDEMK9012F` | 2 | 1 |
| New Client | `newclient000` | `ZZZXX0000Z` | 0 | 0 |

The backend seed file also defines **2 cross-client pattern memories**:

1. `regime_15l_25l_homeloan`
2. `advance_tax_miss_rate`

Total backend-defined seed facts:

```text
11 + 4 + 2 + 0 + 2 cross-client = 19 facts
```

## Seeded Demo Data

### Ramesh Iyer

Client:

- id: `abcri1234d`
- PAN: `ABCRI1234D`
- employer: `infosys`

Tax history:

| Assessment Year | Gross | Tax Paid | Refund |
| --- | ---: | ---: | ---: |
| AY 2021-22 | 15,20,000 | 2,40,000 | 8,000 |
| AY 2022-23 | 16,80,000 | 2,85,000 | 11,000 |
| AY 2023-24 | 18,40,000 | 3,20,000 | 12,000 |

Additional facts:

- salary income AY 2023-24: `18,40,000`
- house property EMI AY 2024-25: `38,000` per month
- 80C deduction AY 2023-24: `1,50,000`
- 80D deduction AY 2023-24: `25,000`
- open 143(1) notice deadline: `2025-06-18`
- preferred regime: old regime because of home loan benefit
- risk profile: low
- average monthly deposit baseline: `80,000` across `12` months

### Priya Sharma

Client:

- id: `bcdps5678e`
- PAN: `BCDPS5678E`
- employer: `tcs`

Tax history:

| Assessment Year | Gross | Tax Paid | Refund |
| --- | ---: | ---: | ---: |
| AY 2022-23 | 9,80,000 | 95,000 | 3,000 |
| AY 2023-24 | 11,20,000 | 1,30,000 | 5,000 |

Additional facts:

- 80C deduction AY 2023-24: `1,20,000`
- preferred regime: new regime for simpler filing

### MK Traders

Client:

- id: `cdemk9012f`
- PAN: `CDEMK9012F`

Business facts:

- turnover AY 2023-24: `45,00,000`
- profit AY 2023-24: `3,80,000`
- GST filed: `true`
- advance tax paid: `85,000`
- open GST scrutiny notice deadline: `2025-07-10`

### Cross-client patterns

| Pattern | Numbers |
| --- | --- |
| Home-loan taxpayers in 15L-25L bracket | `83%` old-regime usage from sample size `47` |
| Advance-tax miss rate in 10L-20L bracket | `34%` missed Q1 from sample size `89` |

## Backend API

Base URL:

```text
http://localhost:8000
```

### `POST /query`

Runs the memory-aware advisory workflow.

Request:

```json
{
  "client_id": "abcri1234d",
  "query": "Check advance tax"
}
```

Response:

```json
{
  "response": "string",
  "routing": {
    "intent": "advisory",
    "client_id": "",
    "agents": ["memory", "advisory"],
    "urgency": "normal",
    "context_needed": ["tax_history", "income"]
  },
  "memory_used": 5
}
```

### `POST /upload/{client_id}/{ay}`

Uploads and parses a Form 16 PDF.

Example:

```text
POST /upload/abcri1234d/ay2425
```

The frontend currently uploads to `ay2425`.

### `GET /memory/{client_id}`

Returns up to `50` memory entries for the selected client.

Example:

```text
GET /memory/abcri1234d
```

### `DELETE /memory/{key}`

Deletes a memory key from the UI perspective. In mock mode, backend deletion is currently a no-op.

### `GET /notices/{client_id}`

Returns:

- `open`
- `closed`

### `GET /yoy/{client_id}/{ay_current}/{ay_previous}`

Compares tax history across two assessment years.

Example:

```text
GET /yoy/abcri1234d/ay2324/ay2223
```

Expected deltas for Ramesh Iyer:

```text
gross_delta = 1,60,000
tax_delta = 35,000
refund_delta = 1,000
```

## Frontend UI

The frontend runs on Vite and calls the backend at:

```text
http://localhost:8000
```

Primary views:

1. **Memory Audit**
   - displays memory entries
   - filters by All, Tax History, Deductions, Income, Preferences, Notices
   - shows average confidence as `72%`
   - shows stale entries as `0`

2. **Advisory Agent**
   - chat interface
   - upload button for PDF files
   - suggestion chips:
     - `Any GST mismatches?`
     - `Upcoming deadlines`
     - `Summarise FY23 income`
     - `Check advance tax`

3. **Compliance & Notices**
   - shown beside Memory Audit
   - separates open and closed notices

## Tech Stack

### Backend

- Python
- FastAPI `0.110.0`
- Uvicorn `0.28.0`
- Groq SDK `0.4.2`
- PyMuPDF `1.24.1`
- python-dotenv `1.0.1`
- LangChain `0.1.13`
- LangGraph `0.0.30`
- LangSmith

### Frontend

- React `19.2.6`
- React DOM `19.2.6`
- Vite `8.0.12`
- Tailwind CSS `4.3.0`
- Framer Motion `12.40.0`
- Lucide React `1.17.0`

### AI and Observability

- Groq models:
  - `llama-3.3-70b-versatile`
  - `qwen/qwen3-32b`
- LangSmith tracing:
  - Orchestrator Agent
  - Advisory Synthesis
  - Document Extraction Agent
  - Hindsight Vector Memory

## Setup

### 1. Clone and enter the project

```bash
cd /home/vijeta/CAI
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=ai-ca-agent
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed by the terminal. The default is usually:

```text
http://localhost:5173
```

## Demo Flow

1. Start the backend on port `8000`.
2. Start the frontend with `npm run dev`.
3. Open the app and select `Ramesh Iyer`.
4. View the Memory Audit page and inspect tax history, income, deductions, notices, and preferences.
5. Ask: `Check advance tax`.
6. Observe that the backend routes the query, recalls memory, and returns `memory_used`.
7. Upload a Form 16 PDF from the Advisory Agent page.
8. Confirm that gross salary and TDS are extracted.
9. Return to Memory Audit and see the new facts added for `ay2425`.
10. Check the Notice panel for open compliance items.

## Project Structure

```text
CAI/
  README.md
  backend/
    main.py
    requirements.txt
    agents/
      advisory.py
      anomaly.py
      document.py
      notice.py
      orchestrator.py
      yoy.py
    data/
      seed_clients.py
    hindsight/
      client.py
      keys.py
    utils/
      groq_retry.py
      mock.py
  frontend/
    package.json
    vite.config.js
    src/
      App.jsx
      api/client.js
      components/
        ChatPanel.jsx
        ClientSidebar.jsx
        MemoryAuditView.jsx
        NoticePanel.jsx
        MemoryCard.jsx
        SplashScreen.jsx
        StatsRow.jsx
```

## Environment Variables

### Required for real LLM calls

```env
GROQ_API_KEY=your_groq_api_key
```

### Optional for tracing

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=ai-ca-agent
```

### Optional for seed script

The seed script checks for:

```env
HINDSIGHT_API_KEY=your_hindsight_api_key
```

The current app uses mock Hindsight storage, so this is only relevant if the memory layer is replaced with a live Hindsight backend.

## Current Limitations

- Hindsight is simulated through in-memory mock storage.
- Memory deletion is a UI update, but backend `mock_delete_entry` is currently a no-op.
- Uploaded files are temporarily written to `/tmp/{filename}`.
- Form 16 extraction uses regex patterns and may need expansion for varied PDF formats.
- The chat header currently displays Ramesh Iyer statically even when another client is selected.
- The sidebar shows Ramesh Iyer as `14 entries`, while backend seeded memory currently contains `11` client entries plus cross-client patterns outside the client namespace.
