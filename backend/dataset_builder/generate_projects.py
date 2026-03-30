import requests
import json
import time
import os

# --- SMAART Dataset Builder: Portfolio Projects ---
# Generates 2 relevant portfolio projects for students per role 
# to ensure they have actionable tasks to close their skill gaps.

OPENROUTER_KEY = os.environ.get("OPENROUTER_API_KEY", "sk-or-your-key-here")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'projects.json')

ROLE_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'role_skills_db.json')

if not os.path.exists(ROLE_DB_PATH):
    print(f"ERROR: {ROLE_DB_PATH} not found. Run generate_skills first.")
    exit(1)

with open(ROLE_DB_PATH) as f:
    role_db = json.load(f)
ALL_ROLES = list(role_db.keys())

# Resume Progress
projects = {}
if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE) as f:
        try:
            projects = json.load(f)
            print(f"✅ Found {len(projects)} existing project mappings.")
        except:
            print("⚠️ Progress file corrupted, starting fresh.")

def save():
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(projects, f, indent=2)

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
            "max_tokens": 800
        },
        timeout=30
    )
    return res.json()["choices"][0]["message"]["content"].strip()

# Batch roles by 3 to allow more tokens for project descriptions
for i in range(0, len(ALL_ROLES), 3):
    batch = [r for r in ALL_ROLES[i:i+3] if r not in projects]
    if not batch:
        continue

    prompt = f"""For each of these career roles, generate 2 portfolio projects that an Indian student can build to get their first job.

Project 1: Beginner level (10-15 hours, free tools only).
Project 2: Intermediate level (20-30 hours, free tools only).

For each project provide:
- title: short project name
- level: "Beginner" or "Intermediate"
- skills_demonstrated: list of 2-4 skill names from the role
- hours_estimate: number
- tool: free tool to use (e.g. MS Excel (free), VS Code)
- how_to_share: one-line advice on how to share this on LinkedIn/GitHub

Roles: {json.dumps(batch)}

Reply ONLY with valid JSON. Format:
{{"Financial Analyst": [{{"title": "...", "level": "Beginner", "skills_demonstrated": ["Excel"], "hours_estimate": 12, "tool": "MS Excel (free)", "how_to_share": "Screenshot on LinkedIn"}}]}}"""

    try:
        raw = call_mistral(prompt)
        raw = raw.replace("```json", "").replace("```", "").strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        result = json.loads(raw[start:end])
        projects.update(result)
        print(f"✅ Processed Batch {i//3 + 1}/{len(ALL_ROLES)//3 + 1} — {list(result.keys())}")
        save()
        time.sleep(2)
    except Exception as e:
        print(f"⚠️ Failed market batch {i//3 + 1}: {str(e)}")
        time.sleep(5)

print(f"\n🏆 Generation Complete. Result stored in {OUTPUT_FILE}")
