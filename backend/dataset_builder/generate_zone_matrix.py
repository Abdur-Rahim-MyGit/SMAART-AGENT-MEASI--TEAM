import requests
import json
import time
import os

# --- SMAART Dataset Builder: Zone Matrix ---
# Uses Mistral-7B to determine if a degree-role pair is 
# Green (Natural Fit), Amber (Skills Gap), or Red (Reskilling Required).

# Fetch key from backend/.env if available, or environment
OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "sk-or-your-key-here")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'zone_matrix.json')

DEGREES = [
    "Bachelor of Commerce",
    "Bachelor of Technology",
    "Bachelor of Arts",
    "Bachelor of Science",
    "BBA",
    "BCA",
    "MBA",
    "MCA",
    "Master of Commerce",
    "Master of Arts",
    "LLB",
    "B.Ed",
    "B.Pharm",
    "MBBS"
]

# Path to the critical role database
ROLE_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'role_skills_db.json')

if not os.path.exists(ROLE_DB_PATH):
    print(f"ERROR: {ROLE_DB_PATH} not found. Generate it first.")
    exit(1)

with open(ROLE_DB_PATH) as f:
    role_db = json.load(f)
ALL_ROLES = list(role_db.keys())

# Resume support: Load existing progress
zone_matrix = {}
if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE) as f:
        try:
            zone_matrix = json.load(f)
            count = sum(len(v) for v in zone_matrix.values())
            print(f"✅ Progress Found: {count} role-degree pairs already done.")
        except:
            print("⚠️ Progress file corrupted, starting fresh.")

def save():
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(zone_matrix, f, indent=2)

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
            "max_tokens": 600
        },
        timeout=30
    )
    return res.json()["choices"][0]["message"]["content"].strip()

print(f"📊 Starting generation for {len(DEGREES)} degrees across {len(ALL_ROLES)} roles...")

for degree in DEGREES:
    if degree not in zone_matrix:
        zone_matrix[degree] = {}

    # Process in batches of 4 to avoid prompt size limits and stay within free tier
    for i in range(0, len(ALL_ROLES), 4):
        batch = ALL_ROLES[i:i+4]
        
        # Skip roles already processed for this degree
        if all(r in zone_matrix[degree] for r in batch):
            continue

        prompt = f"""For an Indian student with a "{degree}" degree, rate each of these job roles from an employer's perspective.

Zone rules (strict):
- Green = Employer regularly hires this degree for this role (e.g. B.Tech for SDE).
- Amber = Consideration possible, but student needs specific extra skills/projects.
- Red = Rarely considered. Major pivot/reskilling required.

skill_coverage_pct = % of role's skills typically covered by a {degree} graduate (0 to 100).

Roles: {json.dumps(batch)}

Reply ONLY with valid JSON. Example:
{{"Financial Analyst": {{"employer_zone": "Green", "skill_coverage_pct": 55}}, "Software Developer": {{"employer_zone": "Red", "skill_coverage_pct": 12}}}}"""

        try:
            raw = call_mistral(prompt)
            # Cleanup common AI code formats
            raw = raw.replace("```json", "").replace("```", "").strip()
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
            
            zone_matrix[degree].update(result)
            print(f"✨ Processed batch {i//4 + 1}/{len(ALL_ROLES)//4 + 1} for {degree}")
            save() # Auto-save progress
            time.sleep(2) # Protect API rate limits
        except Exception as e:
            print(f"⚠️ Failed batch for {degree}: {str(e)}")
            time.sleep(5)

print(f"\n🏆 Generation Complete. Result stored in {OUTPUT_FILE}")
