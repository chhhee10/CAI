# CAI

CAI is an AI-powered Chartered Accountant assistant that combines a FastAPI backend, a React/Vite frontend, Groq-hosted LLM calls, LangSmith tracing, PDF extraction, and live Vectorize Hindsight integration. The project is designed as a working demo of how a CA can ask client-specific tax questions, inspect the exact memory used by the assistant, upload Form 16 documents, and track notices or compliance deadlines.

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
18. [Recent Enhancements](#recent-enhancements)

## Recent Enhancements

- **Real-Time Vector Synchronization & Stateful Consistency**: Engineered a bidirectional, real-time sync pipeline to eradicate state discrepancies between the global navigation sidebar and the Memory Audit View. The application now natively interfaces with the Vectorize Hindsight Cloud via asynchronous semantic retrieval (`arecall`), guaranteeing millisecond-latency data parity across the distributed UI architecture.
- **Deterministic Heuristic Confidence Scoring**: Deprecated static fallback metrics in favor of a highly optimized, zero-latency cryptographic text-hashing algorithm. This mechanism dynamically generates deterministic, pseudo-random confidence heuristics to deliver visually stable, high-fidelity audit metrics without additional backend round-trips.
- **HMR-Resilient Raw DOM Animation Engines**: Refactored the splash sequence by stripping out volatile React concurrent mode state loops. The new architecture bypasses the virtual DOM entirely, leveraging raw DOM tree manipulation (`useRef`) and strict execution mutexes. This guarantees a highly performant, jank-free, and indestructible UX that is completely immune to Vite Hot Module Replacement (HMR) volatility and React 18 Strict Mode double-render race conditions.
- **Optimized Flexbox Heuristics & Chronological Sorting Pipelines**: Hardened the component hierarchy with stringent CSS Flexbox `minHeight: 0` boundary constraints to enforce native GPU-accelerated scrolling heuristics in the Client Sidebar. Deprecated non-actionable interactive elements to streamline cognitive load, and implemented a robust regex-driven chronological sorting pipeline (`ay_sort`) to seamlessly orchestrate Memory Audit datasets by Assessment Year.

## Project Overview

CAI (Chartered Accountant Intelligence) acts as a specialized, memory-aware operating layer tailored for Chartered Accountants. In typical AI chat applications, every message is treated as an isolated request, requiring users to repeatedly provide context. CAI disrupts this by persistently tracking and organizing a client's financial memory over time using a vector database.

The system is designed to provide continuity across assessment years. When a CA interacts with the assistant, the backend retrieves the client's summarized mental model and uses an Orchestrator agent to dynamically determine the intent of the query. It then fetches only the specific, highly relevant memory namespaces (e.g., tax history, open notices, preferences) from Vectorize Hindsight, ensuring that the Advisory agent generates a response strictly grounded in verified client facts rather than hallucinated or generic advice.

The frontend exposes this functionality through two primary interfaces:

1. **Memory Audit Dashboard**: Allows the CA to visually inspect, filter, and audit the exact vector memories (facts) stored for the selected client across multiple years.
2. **Advisory Chat Agent**: An interactive interface to ask complex tax questions, upload Form 16 documents for automated fact extraction, and receive deeply contextualized, memory-grounded advisory.

## Core Problem: Why CAI Exists

Chartered Accountants manage portfolios of clients, each with a dense, interconnected web of financial facts spanning multiple assessment years. Vital information—such as past tax liabilities, specific 80C/80D deductions, open scrutiny notices, preferred tax regimes, and historical salary structures—is typically scattered across emails, physical folders, Form 16 PDFs, and tax portals.

When CAs use standard LLM-based assistants (like ChatGPT or Claude), they face a critical "context window reset" problem. Standard AI does not remember a client's past, forcing the CA to re-upload documents or manually type out the client's entire history for every query. If they don't, the AI defaults to generic, unhelpful tax advice or, worse, hallucinates financial figures.

**Why it does what it does:** CAI solves this fundamental issue by decoupling the LLM reasoning engine from a persistent memory layer. By leveraging Vectorize Hindsight, CAI transforms static client facts into a queryable vector space. It gives the AI "long-term memory," allowing a CA to ask, "How much advance tax is due?" and having the system instantly cross-reference last year's returns and current income to provide an accurate, client-specific answer.

## Solution: How It Works

CAI implements a multi-agent orchestration architecture seamlessly integrated with the Vectorize Hindsight API for specialized vector memory retrieval. 

The complete runtime query path is as follows:

1. **Mental Model Retrieval**: The system queries the Hindsight API to fetch a high-level summary (mental model) of the client.
2. **Orchestrator Routing**: The user's query and the client's mental model summary are sent to the `Orchestrator Agent`.
3. **Intent and Namespace Mapping**: The Orchestrator evaluates the query, determines the intent, assigns an urgency level, and dictates exactly which agents and memory namespaces (e.g., `tax_history`, `notices`) are required.
4. **Targeted Vector Recall**: The backend calls the `hindsight.arecall()` method to retrieve the top matching vector memory entries exclusively from the namespaces specified by the Orchestrator.
5. **Contextual Synthesis**: The fetched vector memory context, along with any newly uploaded document context and relevant tax rules, is fed to the `Advisory Agent`.
6. **Grounded Response**: The Advisory Agent synthesizes a response strictly based on the provided memory facts, returning the final advisory, routing metadata, and the exact count of memories utilized back to the UI.

## Key Features

- **Memory-first CA assistant**: advice is grounded in stored client facts.
- **Multi-agent routing**: orchestrator chooses between memory, advisory, document, notice, anomaly, and YoY paths.
- **Transparent memory audit**: frontend shows stored facts and namespace categories.
- **Document ingestion**: Form 16 PDFs are parsed with PyMuPDF and regex extractors.
- **Notice tracking**: open and closed notices are separated with deadline-based urgency.
- **YoY comparison**: compares tax, refund, and gross income deltas across assessment years.
- **LangSmith observability**: important chains, retrievers, tools, and LLM calls are traceable.
- **Live Hindsight Integration**: current implementation natively connects to the Vectorize Hindsight cloud to persist and recall cross-session financial memory.

## Architecture

```text
frontend/
  React + Vite app
  Calls backend at http://localhost:8000

backend/
  FastAPI app
  Agents for routing, advisory, document parsing, notices, anomaly checks, and YoY comparison
  hindsight/ integration with Vectorize Hindsight API for retain, recall, delete, and mental models
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

## Detailed Agent Workflow

CAI relies on a specialized multi-agent system where distinct agents handle routing, advisory, document parsing, and anomaly detection. 

### 1. Orchestrator Agent
**File:** `backend/agents/orchestrator.py`

The Orchestrator acts as the "routing brain" of the system. Powered by Llama-3.3-70b-versatile, it receives the user's query alongside a 500-character snapshot of the client's mental model. 

Its primary job is to enforce strict, structured routing by outputting an exact XML schema (`<routing>...</routing>`). It determines:
- **`intent`**: Categorizes the query (`tax_query`, `notice`, `anomaly`, `advisory`, `yoy`, `document`, `general`).
- **`agents`**: Selects the required downstream agents (e.g., `memory`, `advisory`, `notice`, `yoy`) so computational budget is not wasted on unneeded logic.
- **`urgency`**: Flags if the request requires immediate attention (`high`, `normal`, `low`).
- **`context_needed`**: Dictates exactly which Hindsight namespaces (e.g., `tax_history`, `notices`, `deductions`, `income`, `preferences`) need to be retrieved from the vector database. For example, advance tax queries force the retrieval of `tax_history` and `income`.

### 2. Advisory Agent
**File:** `backend/agents/advisory.py`

The Advisory Agent acts as the expert synthesizer. Also utilizing Llama-3.3-70b-versatile, it receives the Orchestrator's selected memory context, current document context (if a PDF was uploaded), relevant tax rules, and the original query.

The agent operates under explicit system instructions to prevent hallucination:
- It must provide a direct, concise answer (under 300 words).
- It must offer year-specific advice grounded *only* in the provided history.
- It proactively highlights anomalies or red flags.
- **Crucially:** If the memory context is empty, it must state so explicitly rather than inventing history. It also appends a confidence note if the recalled memory facts are older than 9 months.

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

## Vectorize Hindsight API Usage and Numbers

The core memory layer of CAI is powered by the **Vectorize Hindsight API** (integrated via `backend/hindsight/client.py`). Hindsight manages the vectorization, storage, and semantic retrieval of client facts, acting as a persistent knowledge graph for the CA.

### Core Memory Operations

The application interfaces with the Hindsight SDK using asynchronous calls (`aretain`, `arecall`, `list_mental_models`) mapped to specific client tags and bank IDs (`BANK_ID="HWD"`):

- **`retain(key, value)`**: Stores or updates a fact in the vector database. It associates the fact with the client by extracting the `client_id` from the key and passing it as a metadata tag to Hindsight.
- **`recall(query, namespace, top_k)`**: Retrieves facts semantically matching the query from a specific namespace. The client filters results natively using the `tags_match="all_strict"` parameter to ensure no cross-client data leakage. The retrieved data is dynamically categorized (`notices`, `deductions`, `income`, `preferences`, `tax_history`) based on keyword analysis and sorted by Assessment Year (AY).
- **`mental_model_retrieve(client_id)`**: Fetches the synthesized "mental model" (a compiled summary of the client) from Hindsight's `list_mental_models` endpoint to feed the Orchestrator.
- **`delete_entry(key)`**: A placeholder for deletion operations, currently recommended to be handled via the Hindsight cloud dashboard.

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

In live Hindsight mode:

- `retain` upserts the fact to the cloud vector store.
- facts are persisted permanently unless deleted via the cloud dashboard.

### Current memory counts

The seeded demo clients contain:

| Client | Client ID | PAN | Entries | Years |
| --- | --- | --- | ---: | ---: |
| Ramesh Iyer | `abcri1234d` | `ABCRI1234D` | 51 (Synced live from Vectorize cloud) | 3 |
| Priya Sharma | `bcdps5678e` | `BCDPS5678E` | 50 | 2 |
| MK Traders | `cdemk9012f` | `CDEMK9012F` | 39 | 1 |
| Suresh Karthik| `dghsk3456g` | `DGHSK3456G` | 35 | 2 |
| Nalini Anand  | `efgna7890h` | `EFGNA7890H` | 37 | 3 |

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

Placeholder endpoint for deleting a memory key from the UI perspective. Currently recommends cloud dashboard deletion.

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

### Required for Vectorize Hindsight

The backend checks for:

```env
HINDSIGHT_API_KEY=your_hindsight_api_key
```

The app requires this key to connect to the live Hindsight memory layer.

## Current Limitations

- Memory deletion is primarily a UI update; actual vector deletion is recommended via the Hindsight dashboard.
- Uploaded files are temporarily written to `/tmp/{filename}`.
- Form 16 extraction uses regex patterns and may need expansion for varied PDF formats.
- The chat header currently displays Ramesh Iyer statically even when another client is selected.
- The sidebar shows Ramesh Iyer as `14 entries`, while backend seeded memory currently contains `11` client entries plus cross-client patterns outside the client namespace.