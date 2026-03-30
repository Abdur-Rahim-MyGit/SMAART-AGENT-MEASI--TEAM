# SMAART Career Intelligence Platform — Complete Project Summary

> **Document Date:** March 19, 2026  
> **Project Root:** `b:\CAREER AGENT - 18-03-26\Career-agent-26-main`  
> **Repository:** [github.com/Abdur-Rahim-MyGit/Career-agent-Final](https://github.com/Abdur-Rahim-MyGit/Career-agent-Final)

---

## 1. What Is This Project?

**SMAART** (Student Machine-Assisted Algorithmic & Role-based Trajectory) is a **next-generation AI-powered Career Intelligence Platform** designed specifically for the Indian job market. Its core mission is to help students understand:

- Which career roles best fit their academic background and skills
- Exactly which skills they are missing (and in what priority order to learn them)
- A personalized learning roadmap with certifications, courses, and portfolio projects
- Market intelligence: salary data, employer types, job demand trends, and AI impact

### The Central Architectural Vision

The platform is built around a **Hybrid AI Strategy** — a deliberate design decision that separates *when* AI is used from *how* users are served at runtime:

| Phase | Actor | Frequency | What Happens |
|---|---|---|---|
| **Build Phase** | Claude AI (via OpenRouter) | Quarterly | Generates a massive Knowledge Graph of Skills, Roles, and Salaries |
| **Runtime Phase** | Node.js Rule Engine | Every user request | Mathematically matches student profiles against the Knowledge Graph. **Zero AI calls.** |
| **ML Phase** | Python Microservice | Daily / On-demand | Scrapes job trends; parses resumes using Hugging Face NLP |

This architecture makes the system **fast, cost-effective at scale, and resistant to hallucination** — unlike a naive ChatGPT wrapper.

---

## 2. File & Folder Structure

```
Career-agent-26-main/
│
├── 📁 backend/                     ← Node.js + Express API Server
│   ├── index.js                    ← Main server, all API routes (297 lines)
│   ├── engine.js                   ← Deterministic Rule Engine (183 lines)
│   ├── db.js                       ← PostgreSQL connection (currently mocked)
│   ├── mongoDb.js                  ← MongoDB connection + schema
│   ├── seed.js                     ← DB seeding from JSON data
│   ├── generate_skills_db.js       ← Parses Excel → role_skills_db.json
│   ├── admin_generate_ai_data.js   ← Admin tool to call Claude AI
│   ├── services/
│   │   └── aiService.js            ← OpenRouter/Claude AI caller (build-phase only)
│   ├── data/                       ← role_skills_db.json (Knowledge Graph JSON)
│   ├── records/                    ← Local JSON backup of all analyses
│   ├── migrations/                 ← DB migration files
│   ├── prisma/                     ← Prisma ORM schema (PostgreSQL)
│   └── package.json                ← Express 5, Prisma, Mongoose, JWT, Bcrypt...
│
├── 📁 frontend/                    ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx                 ← Router: 6 pages
│   │   ├── main.jsx                ← React entry point
│   │   ├── index.css               ← Global design system
│   │   ├── pages/
│   │   │   ├── Home.jsx            ← Landing page + history sidebar (185 lines)
│   │   │   ├── Onboarding.jsx      ← 4-step input form (995 lines)
│   │   │   ├── Dashboard.jsx       ← Main results dashboard (853 lines)
│   │   │   ├── Passport.jsx        ← Digital career passport (17KB)
│   │   │   ├── MarketInsights.jsx  ← Market intel page (5.5KB)
│   │   │   └── AdminDashboard.jsx  ← Admin panel for drafts (4.6KB)
│   │   ├── components/
│   │   │   └── Layout.jsx          ← Global layout, navbar
│   │   └── data/
│   │       ├── dropdownData.json   ← Hierarchical education dropdown data
│   │       ├── jobRolesData.json   ← 225+ Indian job roles with family tags
│   │       └── indianCities.json   ← City autocomplete data
│   └── package.json                ← React 19, Framer Motion, Lucide, Recharts...
│
├── 📁 ml-service/                  ← Python + Flask Microservice
│   ├── app.py                      ← Flask server (2 endpoints + health check)
│   ├── resume_parser.py            ← Hugging Face semantic skill extractor
│   ├── scraper.py                  ← Job listing scraper (placeholder)
│   └── requirements.txt            ← Flask, sentence-transformers, XGBoost, Torch
│
├── 📁 Documentation/               ← Internal engineering docs
│   ├── 00_Master_Implementation_Plan.md
│   ├── 01_Architecture_and_Logic.md
│   ├── 02_Full_Roadmap_Phase_by_Phase.md
│   ├── 03_Task_Tracker.md
│   ├── 04_Error_Logs.md
│   ├── 05_Setup_and_Deployment.md
│   └── AI_ML_Architecture_Deep_Dive.md
│
├── 📄 docker-compose.yml           ← Docker config for all 3 services
├── 📄 setup_windows.bat            ← One-click install script (Windows)
├── 📄 start_windows.bat            ← One-click launch script (Windows)
├── 📄 README.md                    ← Collaborator guide
├── 📄 How_To_Run_Guide.md          ← Docker deployment guide
├── 📄 SMAART_Implementation_Plan.md
└── 📄 *.xlsx                       ← Source Excel files (225 roles, degree data)
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 19.x | UI framework |
| **Frontend** | Vite | 7.x | Build tool & dev server |
| **Frontend** | Tailwind CSS | 4.x | Utility-first styling |
| **Frontend** | Framer Motion | 12.x | Animations & transitions |
| **Frontend** | Lucide React | 0.577 | Icon library |
| **Frontend** | Recharts | 3.x | Data charting (installed but limited use currently) |
| **Frontend** | Axios | 1.x | HTTP client |
| **Backend** | Node.js + Express | 5.x | API server |
| **Backend** | Prisma ORM | 6.x | PostgreSQL ORM for auth |
| **Backend** | Mongoose | 9.x | MongoDB ODM for analysis logs |
| **Backend** | pg (node-postgres) | 8.x | Raw PostgreSQL driver |
| **Backend** | JWT + Bcrypt | Latest | Authentication |
| **Backend** | Helmet + Rate Limiter | Latest | Security middleware |
| **ML Service** | Python + Flask | 3.x | Microservice framework |
| **ML Service** | Sentence Transformers | 3.x | Hugging Face NLP |
| **ML Service** | XGBoost | 2.x | ML model (mock currently) |
| **ML Service** | scikit-learn | 1.5 | Cosine similarity for resume parsing |
| **Databases** | PostgreSQL | Any | Relational knowledge graph & auth |
| **Databases** | MongoDB | Any | Unstructured analysis logs |
| **AI (Build-Phase)** | Claude 3.5 Sonnet | via OpenRouter | Quarterly knowledge generation |

---

## 4. How the System Works — End-to-End Flow

### Step 1: Student Opens the Platform (`/`)
- Landing page ([Home.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/Home.jsx)) with feature overview
- "Build Your Career Profile" button → Onboarding
- "View History" sidebar shows past analyses from localStorage

### Step 2: Student Completes 4-Step Onboarding (`/onboarding`)
The [Onboarding.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/Onboarding.jsx) form (995 lines) collects:
1. **Education** — Degree Level → Domain → Degree Group → Specialization (cascading dropdowns, supports dual specialization + "Currently Pursuing")
2. **Career Preferences** — 3 preference tiers (Primary / Secondary / Tertiary), each with: Target Role (typeahead from 225+ roles), Job Sector (up to 3), Job Type, Expected Salary, Location (up to 3 Indian cities, autocomplete), Organisation Type (up to 3)
3. **Work Experience** — Organisation, Designation (role-search typeahead), Sector, Dates (can skip)
4. **Certifications** — Name, Issuer, Year, Credential URL or Scan, Skills demonstrated

On submit, it POSTs all data to `POST /api/onboarding`.

### Step 3: Backend Processes the Request ([engine.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/engine.js))
The **Rule Engine** runs 3 algorithms (no AI calls):

1. **Algorithm 1 — Direction Scoring** ([calculateDirectionScore](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/engine.js#18-50))
   - Checks if student's degree keywords relate to the role name → up to 40%
   - Adds 20% bonus for stated interest (selected as a preference)
   - Calculates how many of the role's required skills the student already has → up to 40%

2. **Algorithm 2 — Skill Gap Calculation** ([calculateSkillGaps](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/engine.js#51-69))
   - Compares student skills against the role's `tech_skills` list
   - Produces `missingSkills` (sorted by priority level: High/Critical) and `matchingSkills`

3. **Algorithm 3 — Zone Determination** ([determineZone](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/engine.js#70-75))
   - Score ≥ 0.6 → **Green Zone** (1–2 months prep)
   - Score ≥ 0.3 → **Amber Zone** (3–5 months prep)
   - Score < 0.3 → **Red Zone** (6+ months + special warning alert)

This runs for all 3 role preferences (primary/secondary/tertiary).

### Step 4: Data Saved to 3 Places Simultaneously
```
Analysis result → Local JSON file (backend/records/) ← Immediate safety backup
               → PostgreSQL (career_analyses table)    ← Structured queries
               → MongoDB (CareerAnalysis collection)   ← Flexible logs
```

### Step 5: Student Sees Dashboard (`/dashboard`)
Results rendered across 5 tabs per role:
| Tab | Name | Content |
|---|---|---|
| 1 | **Market Intel** | Job demand, Average Salary Range, Typical Employers in India, Entry Paths, AI Impact, Emerging Roles |
| 2 | **Technical Skills** | Must-Have (Critical/High priority) vs Nice-to-Have skills |
| 3 | **AI Tools** | AI tools for the role, exposure %, human value areas |
| 4 | **Learning Pathway** | Skill gap (current vs missing), 4-step roadmap, certs, free courses, portfolio projects |
| 5 | **Future Scope** | 5–10 year growth outlook, target audience, growth trajectory |

Additional features:
- **3 Role Cards** at top (Primary / Secondary / Tertiary) — click to switch
- **Zone indicator** (Green/Amber/Red) with hover tooltip
- **Regenerate** — re-runs analysis from saved form data
- **History Sidebar** — stores last 10 analyses in localStorage
- **Terminal Chat Widget** — simple rule-based AI chat (floating bottom-right)
- **Interactive Pathway Diagram** (modal) — visual step-by-step flowchart
- **Export Roadmap PDF** button (UI exists; not yet wired)
- **Red Zone Acknowledgement Modal** — automatically shown if primary zone is Red

---

## 5. What Is ✅ Working

### Frontend (Fully Functional)
- ✅ **Home Page** — Hero section, feature cards, history sidebar with animation
- ✅ **Onboarding Form** — All 4 steps, all input types: cascading dropdowns, role search typeahead (225+ roles), city autocomplete (Indian cities), sector multi-select, org type multi-select, certification upload (URL/Scan/QR modes with skill tagging)
- ✅ **Auto-save draft** — Form data saved to localStorage on every keystroke; restored on refresh
- ✅ **Form reset** — "Reset All" with confirmation
- ✅ **Dashboard rendering** — All 5 tabs, all 3 role vectors, switching between them
- ✅ **Zone-based colour coding** — Green/Amber/Red with appropriate icon and borders
- ✅ **Red Zone modal** — Auto-pops up with acknowledgement button
- ✅ **History sidebar** — Stores 10 past analyses, loads them back into dashboard
- ✅ **Regenerate analysis** — Re-POSTs saved form data and updates dashboard in-place
- ✅ **Terminal chat widget** — Opens/closes, simple scripted response
- ✅ **Interactive pathway modal** — Animated step-by-step diagram
- ✅ **Learning steps completion tracking** — Checkbox on each roadmap step (persists in-session)
- ✅ **Animations** — Framer Motion transitions throughout (fade-in, spring-out, hover lifts)
- ✅ **Navigation** — React Router with 6 routes
- ✅ **Layout + Navbar** — Responsive layout shell

### Backend (Fully Functional)
- ✅ **POST `/api/onboarding`** — Core endpoint, runs the Rule Engine, saves to 3 data layers
- ✅ **Rule Engine** ([engine.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/engine.js)) — All 3 deterministic algorithms working; generates full report
- ✅ **Local File Safety Backup** — `backend/records/` JSON files created on every analysis
- ✅ **GET `/api/roles`** — Returns all roles from mock data
- ✅ **JWT Authentication** — `/api/auth/register` and `/api/auth/login` fully implemented
- ✅ **Security** — Helmet headers, rate limiting (10,000 req/15 min for dev), CORS enabled
- ✅ **Admin Draft Management** — GET `/api/admin/drafts`, POST `/api/admin/drafts/approve`, POST `/api/admin/drafts/reject`
- ✅ **MongoDB Connection + Schema** — Mongoose model defined, saves on each analysis
- ✅ **Error Resilience** — Each database save is wrapped in its own try/catch; one failure doesn't break another

### ML Service (Partially Functional)
- ✅ **Flask server starts** on port 5001
- ✅ **`/health` endpoint** works
- ✅ **`/parse-resume`** (text-based) — Hugging Face `all-MiniLM-L6-v2` model does semantic matching on resume text; extracts skill names
- ✅ **`/predict-success`** — Returns a mock probability score from [MockStudentSuccessModel](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/app.py#12-18) (XGBoost class defined, outputs a scaled sum score)
- ✅ **CORS enabled** on ML service

---

## 6. What Is ❌ Not Working / Incomplete

### Critical Gaps

| Issue | Location | Severity | Details |
|---|---|---|---|
| **PostgreSQL is mocked out** | [backend/db.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/db.js) | 🔴 High | [executeQuery()](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/db.js#3-7) returns `[]` always. Raw PostgreSQL saves in `POST /api/onboarding` silently do nothing. Only Prisma (auth only) and MongoDB work. |
| **Knowledge Graph is very small** | `backend/data/role_skills_db.json` | 🔴 High | The rule engine looks up roles here. If a student selects a role not in this file, it falls back to a single generic "Domain Knowledge" skill — producing generic/useless output. |
| **Resume Parser doesn't read PDF files** | [ml-service/resume_parser.py](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/resume_parser.py) | 🟡 Medium | The [extract_skills_from_text()](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/resume_parser.py#47-88) function expects raw text. There's no PDF-to-text conversion (`pdfminer`, `PyMuPDF`, etc. are missing). Students can't upload PDFs. |
| **Resume parser not connected to onboarding** | [backend/index.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/index.js), `frontend/` | 🟡 Medium | The `/api/parse-resume` backend endpoint exists, but the Onboarding form has no "upload resume" button or auto-fill UI. The ML service is called manually, not through the user journey. |
| **Job scraper is a placeholder** | [ml-service/scraper.py](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/scraper.py) | 🟡 Medium | [scraper.py](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/scraper.py) exists but appears to be a placeholder without real scraping logic (Playwright/BeautifulSoup). Daily automated scraping is not implemented. |
| **XGBoost model is mocked** | [ml-service/app.py](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/app.py) | 🟡 Medium | [MockStudentSuccessModel](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/app.py#12-18) computes [sum(features) / 30](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/resume_parser.py#89-112). No real trained ML model exists. |
| **"Export Roadmap PDF" button** | [Dashboard.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/Dashboard.jsx) line 622 | 🟠 Low | Button is rendered in the UI but has no `onClick` handler wired. Clicking it does nothing. |
| **"Simulate" button** | [Dashboard.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/Dashboard.jsx) line 216 | 🟠 Low | Button exists in the dashboard header but has no logic attached. |
| **"Explore Active Job Roles" modal** | [Dashboard.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/Dashboard.jsx) lines 769–781 | 🟠 Low | Shows 3 hardcoded placeholder jobs ("TechCorp Inc.", "Global Stack"). Not connected to any real job API. |
| **Admin Dashboard not authenticated** | [AdminDashboard.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/AdminDashboard.jsx), [index.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/index.js) | 🟠 Low | The `/admin` route and `/api/admin/*` endpoints have no JWT middleware guard — anyone can access them. |
| **Career Passport page** | [Passport.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/Passport.jsx) | 🟠 Low | Page exists but needs review — likely has incomplete data rendering from the analysis. |
| **MarketInsights page** | [MarketInsights.jsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/pages/MarketInsights.jsx) | 🟠 Low | Page exists as a standalone page; unclear if it's dynamically driven or static content. |

### Algorithm Limitations (Not Bugs, But Known Weaknesses)

- **Degree match is keyword-based, not semantic** — The engine checks if role name keywords appear in the degree string. "Data Analyst" → looks for "Data" and "Analyst" in the degree. This is weak and can mis-score many real students.
- **Interest Match always adds 20%** — Every role gets a flat +20% bonus for "interest" regardless of context. This inflates scores.
- **Salary range is hardcoded** — All roles return `"3-8 LPA"` regardless of the actual role. The Knowledge Graph file (`role_skills_db.json`) needs to be populated with real data.
- **Employer / Entry Path data is generic** — The engine falls back to `"MNCs, Startups, IT Consultancies"` and `"Campus Placements, Internships"`. Only a populated Knowledge Graph will make this specific.

---

## 7. Data Flow Diagram

```
Student Browser (React)
       │
       │ POST /api/onboarding { education, preferences, skills, certs... }
       ▼
Backend (Node.js / Express) ─ Port 5000
       │
       ├─► ① Local File Backup → backend/records/analysis_<timestamp>_<name>.json ✅
       │
       ├─► ② Rule Engine (engine.js)
       │       └─ Looks up role in role_skills_db.json
       │       └─ calculateDirectionScore() → 0.0 to 1.0
       │       └─ calculateSkillGaps() → missingSkills[], matchingSkills[]
       │       └─ determineZone() → Green / Amber / Red
       │       └─ Returns full structured analysis object
       │
       ├─► ③ PostgreSQL (via db.js) → ⚠️ MOCKED — does nothing
       │
       ├─► ④ MongoDB (via mongoDb.js) → ✅ Saves analysis document
       │
       └─► Response: { status, recommendations, analysis }
                                │
                                ▼
                         Dashboard.jsx
                    (renders tabs, zones, roadmap)
                                │
                         localStorage
                    (history, draft, last match)

Optional ML Path:
Student Resume Text → POST /api/parse-resume
                              │
                    Forwards to ML Service (Flask) ─ Port 5001
                              │
                     resume_parser.py → Hugging Face Model
                              │
                    Returns extracted skills[]
```

---

## 8. How to Run the Project

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB (local or Atlas URI in `.env`)
- PostgreSQL (optional — currently mocked)

### Setup (One-Time)
```bat
REM Double-click or run:
setup_windows.bat
```
This installs: Python venv + pip packages for ML service, npm for backend, npm for frontend.

### Launch (Every Time)
```bat
REM Double-click or run:
start_windows.bat
```
Or manually in 3 terminals:
```bash
# Terminal 1 — ML Service (Port 5001)
cd ml-service && .venv\Scripts\activate && python app.py

# Terminal 2 — Backend (Port 5000)
cd backend && npm run dev

# Terminal 3 — Frontend (Port 5173)
cd frontend && npm run dev
```

### Environment Variables (`.env` inside `backend/`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smaart_db
DATABASE_URL=postgresql://...   # (Not yet active — mocked)
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=sk-...       # (Only needed for admin build-phase AI calls)
AI_MODEL=anthropic/claude-3.5-sonnet
```

---

## 9. Current Development Status

```
Phase 1: Environment & Database         ████████░░  80% complete
Phase 2: Data Ingestion (Excel → JSON)  ██████░░░░  60% complete
Phase 3: Rule Engine                    ███████░░░  70% complete
Phase 4: Frontend Integration           ████████░░  85% complete
Phase 5: ML Microservice                █████░░░░░  50% complete
Phase 6: Testing & Deployment           ██░░░░░░░░  20% complete
```

| Area | Status |
|---|---|
| Frontend UI/UX | ✅ Essentially complete and polished |
| Onboarding form | ✅ Fully working |
| Rule Engine (basic algorithms) | ✅ Working |
| Knowledge Graph data | ⚠️ Small — needs population |
| PostgreSQL integration | ❌ Mocked |
| MongoDB integration | ✅ Working |
| Hugging Face resume parser | ✅ Works on raw text |
| PDF upload to resume parser | ❌ Not implemented |
| Job scraper (daily automation) | ❌ Not implemented |
| Trained XGBoost model | ❌ Mock only |
| Auth system (JWT) | ✅ Implemented |
| Admin route protection | ❌ Unprotected |
| Docker deployment | 🟡 Config exists, not tested |

---

## 10. Key Documents in the Project

| File | Purpose |
|---|---|
| [Documentation/00_Master_Implementation_Plan.md](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/Documentation/00_Master_Implementation_Plan.md) | Engineering blueprint — the "why" and "how" of the architecture |
| [Documentation/01_Architecture_and_Logic.md](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/Documentation/01_Architecture_and_Logic.md) | Detailed algorithm formulas (5 algorithms) |
| [Documentation/03_Task_Tracker.md](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/Documentation/03_Task_Tracker.md) | Current task completion status |
| [Documentation/04_Error_Logs.md](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/Documentation/04_Error_Logs.md) | Known active blockers and debug workflows |
| [README.md](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/README.md) | Quick-start guide for collaborators |

---

## 11. Recommended Next Steps (Priority Order)

> [!IMPORTANT]
> These are the highest-impact items to unblock and improve the platform right now.

1. **Populate `role_skills_db.json`** — The Knowledge Graph is the heart of the whole platform. Without real role data (skills, salary, employers), every output is generic. The Excel files ([IT_Workforce_Intelligence_225_Roles_Free_Resources.xlsx](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/IT_Workforce_Intelligence_225_Roles_Free_Resources.xlsx)) are the source — run [generate_skills_db.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/generate_skills_db.js) to convert them.

2. **Activate PostgreSQL** — Replace the mocked [db.js](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/backend/db.js) with a real `pg.Pool` connection. Run the Prisma migration for auth and the seed script for the career data.

3. **Wire "Export PDF"** — Connect the Dashboard's Export button using `jsPDF` or `html2canvas` to export the roadmap.

4. **Add PDF parsing to ML service** — Install `pdfminer.six` or `PyMuPDF` and add a PDF-to-text extraction step in [resume_parser.py](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/ml-service/resume_parser.py). Then add an "Upload Resume" button on the Onboarding form.

5. **Protect Admin Routes** — Add JWT middleware (`verifyToken`) to `/api/admin/*` endpoints and the `/admin` frontend route.

6. **Implement real Skill Priority Ranking (Algorithm 3)** — The engine currently doesn't implement the full priority scoring formula ([(num_roles × 10) + importance_weight](file:///b:/CAREER%20AGENT%20-%2018-03-26/Career-agent-26-main/frontend/src/App.jsx#11-27)). This would make the learning roadmap more accurate.

7. **Connect MarketInsights & Passport pages** to real data from the backend.

---

*This document was auto-generated by Antigravity AI on March 19, 2026, by deeply analyzing all source files in the project.*
