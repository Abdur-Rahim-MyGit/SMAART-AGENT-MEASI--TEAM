import requests
import json
import time
import os

# --- SMAART Dataset Builder: Market Intelligence ---
# Provides realistic industry data for salary (LPA), demand, 
# and AI automation risk to ensure students have accurate expectations.

OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "sk-or-your-key-here")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'market_data.json')

ROLE_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'role_skills_db.json')

if not os.path.exists(ROLE_DB_PATH):
    print(f"ERROR: {ROLE_DB_PATH} not found. Run generate_skills first.")
    exit(1)

with open(ROLE_DB_PATH) as f:
    role_db = json.load(f)
ALL_ROLES = list(role_db.keys())

# Resume Progress from existing file
market_data = {}
if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE) as f:
        try:
            market_data = json.load(f)
            print(f"✅ Found {len(market_data)} existing role market entries.")
        except:
            print("⚠️ Progress file corrupted, starting fresh.")

def save():
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(market_data, f, indent=2)

def call_mistral(prompt):
    res = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://smaart.careers",
            "X-Title": "SMAART Career Platform"
        },
        json={
            "model": "mistralai/mistral-7b-instruct:free",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 700
        },
        timeout=30
    )
    return res.json()["choices"][0]["message"]["content"].strip()

# Process roles in batches of 4
for i in range(0, len(ALL_ROLES), 4):
    batch = [r for r in ALL_ROLES[i:i+4] if r not in market_data]
    if not batch:
        continue

    prompt = f"""For each of these job roles in the Indian job market (2024-2025), provide accurate market data.

demand_level: "High" / "Medium" / "Low" (based on current Indian hiring trends)
salary_min_lpa: entry-level salary in Lakhs Per Annum (number only, e.g. 3.5)
salary_max_lpa: senior-level salary in Lakhs Per Annum (number only, e.g. 18.0)
ai_automation_risk: "High" / "Medium" / "Low" (risk of AI automating tasks significantly in 5 years)
emerging_roles: list of 2-3 related AI-augmented roles that are emerging

Roles: {json.dumps(batch)}

Reply ONLY with valid JSON. Format:
{{"Financial Analyst": {{"demand_level": "High", "salary_min_lpa": 4.0, "salary_max_lpa": 12.0, "ai_automation_risk": "Medium", "emerging_roles": ["AI Financial Analyst", "ESG Analyst"]}}}}"""

    try:
        raw = call_mistral(prompt)
        raw = raw.replace("```json", "").replace("```", "").strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        result = json.loads(raw[start:end])
        market_data.update(result)
        print(f"✅ Processed Batch {i//4 + 1}/{len(ALL_ROLES)//4 + 1} — {list(result.keys())}")
        save()
        time.sleep(2) # Protect API rate limits
    except Exception as e:
        print(f"⚠️ Failed market batch {i//4 + 1}: {str(e)}")
        time.sleep(5)

print(f"\n🏆 Generation Complete. Result stored in {OUTPUT_FILE}")
