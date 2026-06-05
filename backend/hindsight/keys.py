def tax_history(client_id: str, ay: str) -> str:
    return f"client:{client_id}:tax_history:{ay}"

def notice(client_id: str, notice_id: str) -> str:
    return f"client:{client_id}:notices:{notice_id}"

def deduction(client_id: str, section: str, ay: str) -> str:
    return f"client:{client_id}:deductions:{section}_{ay}"

def income(client_id: str, source: str, ay: str) -> str:
    return f"client:{client_id}:income:{source}_{ay}"

def preference(client_id: str, pref_key: str) -> str:
    return f"client:{client_id}:preferences:{pref_key}"

def cross_client_pattern(pattern_key: str) -> str:
    return f"cross_client:patterns:{pattern_key}"
