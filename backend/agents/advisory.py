from utils.groq_retry import groq_call_with_retry
from langsmith import traceable

ADVISORY_PROMPT = """
You are the Advisory Agent. You are an expert CA assistant with access to a client's full financial history.

Client memory context:
{memory_context}

Current documents uploaded this session:
{doc_context}

Relevant tax rules:
{tax_rules}

Query: {query}

Respond with:
1. A direct answer to the query
2. Year-specific advice based on the client's history
3. Any anomalies or red flags you notice
4. Confidence note if any memory is older than 9 months

Keep the response under 300 words. Be specific, not generic.
If memory context is empty, say so explicitly — do not invent history.
"""

@traceable(run_type="llm", name="Advisory Synthesis")
async def synthesise(query: str, memory_context: str, doc_context: str, tax_rules: str) -> str:
    from groq import Groq
    client = Groq()
    
    def _call():
        return client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": ADVISORY_PROMPT.format(
                memory_context=memory_context,
                doc_context=doc_context,
                tax_rules=tax_rules,
                query=query
            )}],
            max_tokens=1024,
            temperature=0.2
        )
        
    response = groq_call_with_retry(_call)
    return response.choices[0].message.content
