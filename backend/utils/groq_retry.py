import time
from groq import RateLimitError

def groq_call_with_retry(fn, retries=3):
    for i in range(retries):
        try:
            return fn()
        except RateLimitError:
            if i == retries - 1:
                raise
            time.sleep(2 ** i)
