from utils.groq_retry import groq_call_with_retry

ANOMALY_PROMPT = """
You are analysing a client's bank statement against their historical baseline.

Historical baseline (from memory):
{baseline}

Current statement data:
{current}

Flag any transactions or patterns that deviate significantly from the baseline.
Format each flag as: FLAG: <description> | SEVERITY: high/medium/low
If nothing is unusual, respond: CLEAR
"""

async def detect(baseline: dict, current_data: str) -> str:
    from groq import Groq
    client = Groq()
    
    def _call():
        return client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[{"role": "user", "content": ANOMALY_PROMPT.format(
                baseline=str(baseline),
                current=current_data
            )}],
            max_tokens=400
        )
        
    response = groq_call_with_retry(_call)
    return response.choices[0].message.content
