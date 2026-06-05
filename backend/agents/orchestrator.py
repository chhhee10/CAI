import re
from groq import Groq
from utils.groq_retry import groq_call_with_retry
import json
from langsmith import traceable

SYSTEM_PROMPT = """
You are the Orchestrator Agent. You are the routing brain of an AI CA system. Given a CA query and client context, output routing instructions in this exact XML format and nothing else:

<routing>
  <intent>tax_query|notice|anomaly|advisory|yoy|document|general</intent>
  <client_id>{extracted client identifier}</client_id>
  <agents>memory,advisory</agents>
  <urgency>high|normal|low</urgency>
  <context_needed>tax_history,notices,deductions,income,preferences</context_needed>
</routing>

Rules:
- agents must be a comma-separated list from: memory, document, tax_rule, advisory, anomaly, notice, yoy
- context_needed lists which Hindsight namespaces to fetch before calling downstream agents
- For advance tax queries always include tax_history and income
- For notice queries always include notices
- Never include agents that are not needed for this query
"""

def parse_routing(xml: str) -> dict:
    def extract(tag):
        m = re.search(rf"<{tag}>(.*?)</{tag}>", xml, re.DOTALL)
        return m.group(1).strip() if m else ""
    return {
        "intent": extract("intent") or "advisory",
        "client_id": extract("client_id"),
        "agents": [a.strip() for a in extract("agents").split(",")] if extract("agents") else ["advisory"],
        "urgency": extract("urgency") or "normal",
        "context_needed": [c.strip() for c in extract("context_needed").split(",")] if extract("context_needed") else [],
    }

@traceable(run_type="chain", name="Orchestrator Agent")
async def route(query: str, client_summary: str) -> dict:
    client = Groq()  # uses GROQ_API_KEY from env
    
    def _call():
        return client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Client context: {client_summary}\n\nQuery: {query}"}
            ],
            max_tokens=300,
            temperature=0
        )
        
    response = groq_call_with_retry(_call)
    xml = response.choices[0].message.content
    return parse_routing(xml)
