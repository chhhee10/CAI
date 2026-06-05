import json

MOCK_MEMORY = {
    "abcri1234d": {
        "tax_history": [
            {"key": "client:abcri1234d:tax_history:ay2122", "value": {"gross": 1520000, "employer": "infosys", "tax_paid": 240000, "refund": 8000, "verified": "form16"}},
            {"key": "client:abcri1234d:tax_history:ay2223", "value": {"gross": 1680000, "employer": "infosys", "tax_paid": 285000, "refund": 11000, "verified": "form16"}},
            {"key": "client:abcri1234d:tax_history:ay2324", "value": {"gross": 1840000, "employer": "infosys", "tax_paid": 320000, "refund": 12000, "verified": "form16"}}
        ],
        "notices": [
            {"key": "client:abcri1234d:notices:n001", "value": {"date": "2024-11-15", "type": "143(1)", "ay": "2024-25", "status": "open", "deadline": "2025-06-18"}}
        ],
        "income": [
            {"key": "client:abcri1234d:income:salary_ay2324", "value": {"amount": 1840000, "employer": "infosys"}},
            {"key": "client:abcri1234d:income:house_property_ay2425", "value": {"flat": "whitefield", "emi": 38000, "purchased": "2025-03"}},
            {"key": "client:abcri1234d:income:monthly_cash_avg_ay2324", "value": {"avg_monthly_deposit": 80000, "months_sampled": 12}}
        ],
        "deductions": [
            {"key": "client:abcri1234d:deductions:80c_ay2324", "value": {"amount": 150000, "instrument": "sbi_life", "maxed": True}},
            {"key": "client:abcri1234d:deductions:80d_ay2324", "value": {"amount": 25000, "instrument": "health_insurance"}}
        ],
        "preferences": [
            {"key": "client:abcri1234d:preferences:regime", "value": {"regime": "old", "reason": "home_loan_benefit"}},
            {"key": "client:abcri1234d:preferences:risk", "value": {"risk": "low", "comm_style": "formal"}}
        ]
    },
    "bcdps5678e": {
        "tax_history": [
            {"key": "client:bcdps5678e:tax_history:ay2223", "value": {"gross": 980000, "employer": "tcs", "tax_paid": 95000, "refund": 3000, "verified": "form16"}},
            {"key": "client:bcdps5678e:tax_history:ay2324", "value": {"gross": 1120000, "employer": "tcs", "tax_paid": 130000, "refund": 5000, "verified": "form16"}}
        ],
        "deductions": [
            {"key": "client:bcdps5678e:deductions:80c_ay2324", "value": {"amount": 120000, "instrument": "ppf", "maxed": False}}
        ],
        "preferences": [
            {"key": "client:bcdps5678e:preferences:regime", "value": {"regime": "new", "reason": "simpler_filing"}}
        ]
    },
    "cdemk9012f": {
        "tax_history": [
            {"key": "client:cdemk9012f:tax_history:ay2324", "value": {"turnover": 4500000, "profit": 380000, "gst_filed": True, "advance_tax_paid": 85000}}
        ],
        "notices": [
            {"key": "client:cdemk9012f:notices:n001", "value": {"date": "2025-01-10", "type": "GST_scrutiny", "ay": "2024-25", "status": "open", "deadline": "2025-07-10"}}
        ]
    }
}

CROSS_CLIENT_MEMORY = [
    {"key": "cross_client:patterns:regime_15l_25l_homeloan", "value": {"bracket": "15L-25L", "home_loan": True, "old_regime_pct": 83, "sample_size": 47}},
    {"key": "cross_client:patterns:advance_tax_miss_rate", "value": {"missed_q1_pct": 34, "bracket": "10L-20L", "sample_size": 89}}
]

async def mock_retain(key: str, value: dict) -> None:
    parts = key.split(":")
    if len(parts) >= 3:
        client_id = parts[1]
        namespace = parts[2]
        if client_id not in MOCK_MEMORY:
            MOCK_MEMORY[client_id] = {}
        if namespace not in MOCK_MEMORY[client_id]:
            MOCK_MEMORY[client_id][namespace] = []
            
        for i, item in enumerate(MOCK_MEMORY[client_id][namespace]):
            if item["key"] == key:
                MOCK_MEMORY[client_id][namespace][i]["value"].update(value)
                return
                
        MOCK_MEMORY[client_id][namespace].append({"key": key, "value": value})
async def mock_recall(query: str, namespace: str = "", top_k: int = 5) -> list[dict]:
    results = []
    if "cross_client" in namespace:
        for item in CROSS_CLIENT_MEMORY:
            if namespace in item["key"]:
                results.append(item)
    else:
        client_id = namespace.split(":")[1] if ":" in namespace else ""
        ns_key = namespace.split(":")[2] if len(namespace.split(":")) > 2 else ""
        
        if client_id in MOCK_MEMORY:
            if ns_key and ns_key in MOCK_MEMORY[client_id]:
                results.extend(MOCK_MEMORY[client_id][ns_key])
            elif not ns_key:
                for k, v in MOCK_MEMORY[client_id].items():
                    results.extend(v)
    return results[:top_k]

async def mock_mental_model_retrieve(client_id: str) -> dict:
    return MOCK_MEMORY.get(client_id, {})

async def mock_delete_entry(key: str) -> None:
    pass
