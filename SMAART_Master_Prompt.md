# SMAART Career Intelligence Platform — Master Build Prompt
## The Complete Reference Document for Rebuilding This Platform from Scratch

---

## 🎯 WHAT YOU ARE BUILDING

**SMAART** is a single-page, self-contained HTML/CSS/JS career intelligence platform for Indian students and placement officers. It takes a student's education, skills, work experience, certifications, and career goals — runs them through a simulated ML analysis — and produces a detailed 3-path career dashboard.

**Tech stack:** Pure HTML + CSS + vanilla JS. No frameworks. No npm. No build step. One `.html` file that works when opened in any browser.

---

## 🎨 DESIGN SYSTEM — COPY THESE EXACTLY

### Fonts (Google Fonts — load both)
```
Plus Jakarta Sans — weights 300, 400, 500, 600, 700, 800 — used for ALL body, UI, labels
Instrument Serif (italic) — used ONLY for the hero heading italic em tag on onboarding
```

### Color Tokens (Dark Mode — default)
```css
--navy:    #060e1f   /* page background */
--navy2:   #0c1930   /* sidebar, input backgrounds */
--navy3:   #111f3d   /* modals, elevated surfaces */
--navy4:   #172548   /* hover states */
--accent:  #4f8ef7   /* primary blue — buttons, active states, bars */
--accent2: #22d3ee   /* cyan — gradients, badges, chart fills */
--accent3: #a78bfa   /* purple — tertiary path, emerging chips */
--green:   #10b981   /* success, green zone */
--amber:   #f59e0b   /* warning, amber zone */
--red:     #ef4444   /* danger, red zone */
--text:    #eef2ff   /* primary text */
--text2:   #c7d2f0   /* secondary text */
--muted:   #6b7fa8   /* labels, placeholders, dimmed items */
--border:  rgba(255,255,255,0.07)   /* subtle borders */
--border2: rgba(255,255,255,0.14)   /* stronger borders on hover */
--card:    rgba(12,25,48,0.9)       /* card background */
--card2:   rgba(17,31,61,0.95)      /* elevated card */
```

### Color Tokens (Light Mode — toggled via body.light-mode)
```css
--navy:    #f0f4ff
--navy2:   #e4eaf8
--navy3:   #dae2f5
--navy4:   #cdd8f0
--text:    #0f1c3d
--text2:   #1e3058
--muted:   #5a6e99
--border:  rgba(0,0,0,0.08)
--border2: rgba(0,0,0,0.15)
--card:    rgba(255,255,255,0.95)
--card2:   rgba(255,255,255,0.98)
```

### Background Effects (body::before and body::after)
- `::before` — two radial gradient blobs: blue top-left, purple bottom-right, both very subtle (0.09 / 0.07 opacity)
- `::after` — a dot-grid pattern: 48px × 48px grid lines at 0.02 opacity blue
- Both are `position:fixed; inset:0; pointer-events:none; z-index:0`

### Base Styles
```css
font-size: 14px base
line-height: 1.6
overflow-x: hidden
```

---

## 🏗️ APPLICATION ARCHITECTURE — 5 SCREENS

The entire app lives in one HTML file. Screens are shown/hidden with `display:none / block`:

| Screen ID | Purpose | Trigger |
|---|---|---|
| `#screen-onboard` | 6-step form | Default visible on load |
| `#screen-loading` | Animated analysis progress | After form submit |
| `#screen-dashboard` | Main 3-path career dashboard | After loading completes |
| `#screen-admin` | Admin panel (KPIs, approvals) | Nav "Admin" link |
| `#screen-po` | Placement Officer panel | Nav "PO View" link |

**Screen switch function:**
```js
function showScreen(id) {
  ['screen-onboard','screen-dashboard','screen-loading','screen-admin','screen-po']
    .forEach(s => document.getElementById(s).style.display = 'none');
  const target = document.getElementById('screen-' + id);
  target.style.display = id === 'loading' ? 'flex' : 'block';
  window.scrollTo(0, 0);
}
```

---

## 🔝 NAVIGATION BAR

**Position:** `fixed top:0 left:0 right:0` | Height: `56px` | z-index: 300

**Background:** `rgba(6,14,31,0.97)` + `backdrop-filter: blur(24px)` + bottom border `1px solid var(--border)`

**Structure (left → center → right):**
```
[LOGO: SMAART + BETA badge]   [Nav links]   [Theme toggle | Login btn | View Dashboard btn]
```

**Logo:** "SMAART" in 1.15rem 800-weight. The "A" is colored `var(--accent)`. "BETA" badge has gradient background (`--accent` to `--accent2`), white text, 0.48rem.

**Nav Links — ALL FUNCTIONAL:**
- Home → `showScreen('onboard')`
- Market Insights → `switchSub(1)` (goes to Market Intel tab in dashboard)
- Career Passport → `printPassport()` (opens printable window)
- Admin → `showScreen('admin')`
- PO View → `showScreen('po')`

Each link is styled: `color: var(--muted)`, hover gets `color: var(--text)` + `background: rgba(255,255,255,0.05)` + `border-radius: 8px`. Font: 0.78rem, weight 500.

**Theme Toggle button:** pill shape, `border-radius: 20px`, shows 🌙/☀️ icon + "Dark"/"Light" label. Saves to `localStorage('smaart-theme')`.

**Login button:** ghost style — transparent bg, `border: 1px solid var(--border2)`. Shows alert on click.

**View Dashboard button:** gradient `var(--accent)` to `#3b6fe0`, white text, `box-shadow: 0 4px 14px rgba(79,142,247,0.3)`.

---

## 📋 SCREEN 1 — ONBOARDING FORM (6 Steps)

**Layout:** Centered, max-width 820px, padding 5.5rem top (nav height).

**Hero header:**
- Small pill badge: "AI-Powered Career Mapping" with a pulsing cyan dot
- H1: `Build your` + italic serif `Career Intelligence` + `Profile in 6 steps`
- Subtext: "Analysed against 225+ roles · 18,000+ degree-role mappings · live market data · 3 career paths"

**Step Indicator:** 6 circles connected by lines. States: default (gray border), active (blue border + glow), done (green filled ✓). Lines animate green as you progress.

**Form Card:** `border-radius: 20px`, glass card style, 3-color gradient top bar (accent → accent2 → accent3).

**6 Steps:**

**Step 1 — Profile Basics:** Full Name*, Email*, Phone, Location (2-col grid)

**Step 2 — Education Profile:** Degree Level (select), Degree Group (10 options: Engineering, MCA, MBA, BSc, BCom, Arts, Medical, Law, Architecture, Education), Specialisation 1*, Specialisation 2, University, Graduation Year (2015-2030), CGPA, "Currently Pursuing?" checkbox

**Step 3 — Skills Registry:** Text input + "+ Add" button (or press Enter). Shows tag chips in cyan. Quick-add chips for: Python, SQL, Java, AWS, React, Docker, Tableau, Power BI, Machine Learning, Node.js, Kubernetes, TensorFlow, Excel, Figma.

**Step 4 — Work History:** Designation*, Organization, Sector (20 Indian sectors), Experience Type (7 options), Start Date, End Date, "Currently working here" checkbox. "+ Add Another Experience" button.

**Step 5 — Certifications:** Certificate Name, Issuing Org, Year (2010-2026), Verification Mode (URL/QR/Not Verified), Verification URL. "+ Add Another Certification" button.

**Step 6 — Career Preferences (3 paths):**
- Primary (blue left bar): Sector, Job Family, Job Role*, Job Type, Salary (0-3/3-5/5-8/8+ LPA), Location, Org Type (9 checkboxes in 3-col grid)
- Secondary (amber left bar): Sector, Job Family, Job Role, Job Type, Salary, Location, Org Type dropdown
- Tertiary (purple left bar): Sector, Job Role, Job Type, Salary, Location, Org Type

**Form Navigation:**
- Left: Back button + "⚡ Load Sample" button (dashed border)
- Right: "Step X of 6" counter + Next/Submit button
- Submit triggers the loading screen

**Load Sample fills:** Priya Sharma, priya.sharma@email.com, Computer Science, skills: python/aws/docker/sql/react, p1=Cloud Engineer, p2=Data Analyst, p3=Frontend Developer

---

## ⏳ SCREEN 2 — LOADING / ANALYSIS SCREEN

**Layout:** `position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem`

**Contents:**
1. SMAART logo (2rem, 800-weight, "A" in accent color)
2. 6 animated step items (each with pulsing dot + text), shown one-by-one
3. Progress bar (3px height, accent→accent2 gradient)
4. Percentage text

**6 Steps text:**
1. "Matching profile against 225+ roles…"
2. "Running zone matrix (18,000+ mappings)…"
3. "Calculating skill coverage & gaps…"
4. "Fetching live market data…"
5. "Running ML success prediction…"
6. "Building your 3-path career roadmap…"

**Timing:** Each step ~600ms. After all 6 complete → 500ms delay → switch to dashboard → animate bars after 400ms → show reminder widget after 8000ms.

---

## 📊 SCREEN 3 — MAIN DASHBOARD

### Dashboard Header (fixed below nav)

**Height:** auto | Padding: `1.1rem 4% 0` | Background: `var(--navy)` | Bottom border

**Left side:**
- `Welcome back, [Name]` — 1.25rem, 800-weight. Name has gradient text (accent2 → accent)
- Meta line with a pulsing green dot: "Analysis complete · 22 March 2026 · 3 career paths mapped · ML Engine v2.4"

**Right side — two action buttons:**
- Share (with upload SVG icon)
- Passport (with document SVG icon)
Both: `rgba(255,255,255,0.05)` bg, `var(--border2)` border. Hover: blue tint.

**Role Tabs Bar (below the header):**
3 tabs: Primary — Cloud Engineer | Secondary — Data Analyst | Tertiary — Frontend Dev
Each has a 7×7px colored zone dot (amber/green/red). Active tab: `border-bottom: 2.5px solid var(--accent)`, full-color text. Hover: `var(--text2)`.

---

### Sidebar (210px wide, sticky)

**Background:** `var(--navy2)` | Right border | Sticky below nav (top: 56px, height: calc(100vh - 56px)) | Thin scrollbar

**Section 1 — Sidebar Header:**
Role indicator pill showing current role name + colored dot (amber/green/red with glow). Updates when role tab changes.

**Section 2 — "Navigation" label (uppercase, muted, tiny)**

**8 Main items (with SVG icons, NO emojis):**
0. Role Overview (grid icon)
1. Market Intel (waveform icon)
2. Tech Skills (code brackets icon)
3. AI Tools (brain/circuit icon)
4. Roadmap (house/path icon)
5. Projects (document icon)
6. Resources (book icon)
7. Job Search (briefcase icon)

Each item: `padding: 0.58rem 1rem`, left border 2.5px (transparent → accent when active), hover bg `rgba(255,255,255,0.035)`. Active: accent left border + `rgba(79,142,247,0.07)` background + icon turns accent color.

**Divider line** between main items and analysis tools section

**Section 3 — "Analysis Tools" (collapsible dropdown)**
Trigger button shows "ANALYSIS TOOLS" label + chevron icon that rotates 180° when open.
Slide animation: `max-height: 0 → 200px`, `opacity: 0 → 1`, `transition: 0.3s cubic-bezier(0.4,0,0.2,1)`.
Starts OPEN by default.

3 sub-items (indented `padding-left: 1.2rem`):
- 8. Compare Paths (table icon)
- 9. Skill Overlap (share/network icon)
- 10. Resume Tips (edit icon)

**Sidebar Footer (pinned bottom):**
"Share Analysis" button — full width, blue tint bg (`rgba(79,142,247,0.08)`), blue border, cyan text. With upload SVG icon.

---

### Dashboard Main Content

Each role has 11 sub-panels (p0–p10). Only one role-panel and one sub-panel active at a time.

---

## 📄 TAB 0 — ROLE OVERVIEW (most important, designed as hero)

### Region Box (top)
Blue-tinted box (`linear-gradient(135deg, rgba(79,142,247,0.08), rgba(34,211,238,0.05))`), blue border.

**Header row:** "🌍 Market Demand — [Region] · [Role]" on left. Region selector buttons on right + demand badge.

**Region buttons:** India 🇮🇳 | USA 🇺🇸 | UK 🇬🇧 | UAE 🇦🇪 | Canada 🇨🇦 | Australia 🇦🇺
Active button: `rgba(79,142,247,0.15)` bg, blue border, cyan text.

**Demand badge:** Green/Amber/Red pill — "🟢 High Demand" / "🟡 Medium Demand" / "🔴 Lower Demand"

**Stats row (3 boxes with subtle inner bg `rgba(255,255,255,0.04)` + border-radius 8px):**
- Avg Salary (in green for India)
- Active Job Listings
- Annual Job Growth (CAGR)

**Region data:**
| Region | Salary | Jobs | Growth | Demand |
|--------|--------|------|--------|--------|
| India | ₹8–20L | 45,000+ | 28% CAGR | high |
| USA | $110k–180k | 280,000+ | 22% CAGR | high |
| UK | £55k–95k | 48,000+ | 19% CAGR | high |
| UAE | AED 120k–240k | 18,000+ | 35% CAGR | high |
| Canada | CAD 90k–145k | 52,000+ | 21% CAGR | med |
| Australia | AUD 100k–160k | 35,000+ | 18% CAGR | med |

### ML Score Banner
Blue gradient card. Large score number (3rem, 800-weight) in amber/green/red based on score. Vertical divider line. Right side has title, description, and animated progress bar (accent → accent2 gradient fill, animates on load).

**Cloud Engineer:** 67% (amber) | **Data Analyst:** 78% (green) | **Frontend Dev:** 31% (red)

### Zone Cards Grid (3 columns)
Each card is color-tinted (amber/green/red gradient bg + matching border). Clickable → opens modal with detailed explanation.

**Card contents:**
- Label: "EDUCATION · ROLE FIT" (uppercase, tiny, muted)
- Large percentage number in zone color (2rem, 800-weight)
- Zone indicator: colored dot + "Amber Zone" / "Green Zone" / "Red Zone"
- Small sub-info (degree type, matched skills, etc.)
- Animated fill bar (3px height, animates width on load)
- One-line insight text (muted, light weight)

**Cloud Engineer zones:**
- Education: Amber 42% — "Degree: MCA"
- Skills: Green 55% — "Matched: AWS, Docker"
- Experience: Amber 40% — "Type: Internship"

### Role Intel Grid (2×2 cards)
Each `ri-card` has: uppercase muted SVG-icon label + content.
1. Typical Employers (text list with bolded key names)
2. Prep Time Estimate (large colored number + sub-text)
3. Entry Paths (text list)
4. 5–7 Year Growth Path (arrow chain text)

### Emerging Roles Strip
Dedicated `emerging-strip` card with label + chip row. Chips in blue and purple.

---

## 📈 TAB 1 — MARKET INTELLIGENCE

4-column stat grid (Market Demand, Salary Range, AI Auto Risk, CAGR Growth).
2-column info cards (Demand Narrative, AI Automation Impact, AI Exposure %, Top Hiring Cities).
Section heading + green chip row for "Human-Only Skills (AI Cannot Replace)".

---

## 🔧 TAB 2 — TECH SKILLS

Two sections: "Must-Have (Critical & High)" + "Nice-to-Have (Medium & Emerging)"

Each skill card: `background: var(--card2)`, hover lifts 1px + shadow. Clickable → skill modal.

**Card layout:** Left: skill name + platform. Right: priority badge (Critical=red, High=amber, Medium=blue, Emerging=purple) + ✓ (green) or ✕ (red) have/need icon.

**Priority badge CSS classes:** `.pb-crit` `.pb-high` `.pb-med` `.pb-low` — each is a small all-caps pill.

Skill modal contains: have/need status, description box, "Why This Skill Matters" box, learning resources list (with 🆓/💰/🏅 icons and clickable URLs).

---

## 🤖 TAB 3 — AI TOOLS

Grid of AI tool cards (`repeat(auto-fill, minmax(245px, 1fr))`).
Each card: tool name + priority badge, description text, bottom meta row (platform + "↗ details" link).
Clickable → modal with description + official links.

---

## 🗺️ TAB 4 — ROADMAP (with Progress Tracker)

6 roadmap items for Cloud Engineer (3 for Data Analyst, 4 for Frontend Dev).

Each item: numbered circle (blue) + month label + title + description + hours badge + 3 progress buttons.

**Progress buttons:** "⏳ In Progress" (blue tint) | "✅ Mark Done" (green tint) | "📋 Details" (gray)

**Toggle behavior:** Click same button again to un-toggle. Done items get green border + green circle. In-progress items get blue border + blue bg.

Below roadmap: Certification grid (clickable → cert modal with cost, validity, format, registration URL).
Below certs: Star rating widget (5 stars, amber on hover/select, confirmation messages).

---

## 🛠️ TAB 5 — PORTFOLIO PROJECTS

2-column project grid. Each card: level badge (Beginner/Intermediate/Advanced) + title + description + tech tag chips. Clickable → modal with full description, tech stack, timeline, what you'll learn.

---

## 📚 TAB 6 — LEARNING RESOURCES

Auto-fill grid of resource cards. Each: type badge (FREE=green / PAID=amber / CERT PREP=purple) + title + platform + description + "↗ url" link. Clickable → modal.

---

## 💼 TAB 7 — JOB SEARCH

Grid of job portal cards (auto-fill, minmax 200px). Each is an `<a>` tag opening in new tab.
Portals: Naukri.com, LinkedIn Jobs, Instahyre, Indeed India, Wellfound, Glassdoor, Cutshort, Remote Jobs.
Each card: colored icon square + platform name + "Search [Role] →" sub-text.
Below grid: Application tips box (blue-tinted, with numbered bold tips).

---

## 📊 TAB 8 — COMPARE PATHS (Global — same for all 3 roles)

`<table>` with 4 columns: Metric | Primary | Secondary | Tertiary.
Headers color-coded: blue/amber/purple tint backgrounds.
10 rows: Overall Zone, ML Score, Skill Coverage, Prep Time, Salary Range, Market Demand, AI Automation Risk, Education Fit, Experience Fit, Best For.
Winner cells: `.ct-winner` class = green color + bold + 🏆 emoji.
Below table: green-tinted SMAART Recommendation box.

Panels for role 1 and role 2 are cloned from role 0's panel dynamically in JS.

---

## 🔀 TAB 9 — SKILL OVERLAP MAP (Global)

Legend: 3 colored dots + labels.
Grid of skill rows, each showing: skill name + 3 path badges (active/inactive) + overlap badge.

**Badge states:**
- ALL 3 paths: green badge "ALL 3"
- 2 paths: blue badge "2 PATHS"
- 1 path: gray badge "PRIMARY" / "SECONDARY" / "TERTIARY"

Path badges: active-primary (blue tint), active-secondary (amber tint), active-tertiary (purple tint), inactive (0.3 opacity).

Below grid: blue-tinted "Combined Learning Priority Order" box.

---

## 📝 TAB 10 — RESUME TIPS

2-column grid of tip cards. Each: icon + title + tip text + example box (italic, dark bg).
Zone-specific content: Amber zone tips for Cloud Engineer, Green zone for Data Analyst, Red zone for Frontend Dev.
Includes LinkedIn headline formulas, ATS keyword chips, resume summary templates, portfolio section guidance.

---

## 🖼️ MODAL SYSTEM

**Overlay:** `position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px)` — fades in with opacity transition. Click outside to close.

**Modal box:** max-width 700px, max-height 88vh, `border-radius:18px`, `var(--navy3)` background, scales from 0.95 → 1 on open.

**Top bar:** sticky, 3-color gradient top line (accent → accent2 → accent3), title + ✕ close button.

**Body sections:** `modal-section` divs with uppercase muted section titles + content (desc-box, row pairs, resource lists).

**Resource list items:** horizontal flex, icon box (28×28px rounded), title + subtitle + clickable URL.

**Types:** openZoneModal | openSkillModal | openAIToolModal | openCertModal | openRoadmapModal | openProjectModal | openResModal

---

## ⚙️ SCREEN 4 — ADMIN DASHBOARD

Header: title + Back/Export/Sync buttons.

**KPI row (4 columns):** Total Students (12,847) | Active Colleges (68) | Analyses Completed (38,291) | Avg Success Score (61%)

**Market Data Queue:** 3 items showing pending/approved status. Approve/Reject buttons that update the item's badge and border color. Approved: green. Rejected: red + 0.5 opacity.

**2-column grid:** Top Colleges list (5 rows with status badges) + Zone Distribution (progress bar split + 4 stat boxes).

**Most Chosen Roles:** Auto-fill grid of icon + role name + count.

**System Status:** 5 status indicators with pulsing colored dots (green=operational, amber=degraded).

---

## 🏫 SCREEN 5 — PLACEMENT OFFICER DASHBOARD

Header: "Placement Officer Dashboard" + college/batch info + action buttons.
Privacy notice banner.

**Batch KPIs (5 columns):** Batch Size (284) | Profiles Complete (231) | Avg Score (63%) | Green Zone (89) | Need Support (47)

**Zone Breakdown by Career Path:** 3 cards, each with a colored progress bar split (green/amber/red) + percentage breakdown.

**2-column grid:** Top Skill Gaps (4 bars with role percentage) + PO Recommendations (3 colored tip boxes: green/blue/amber).

**Upcoming Placement Drives:** 3 cards with drive name + status badge (Open=green / Closing Soon=amber / Upcoming=blue) + details.

---

## 🔔 REMINDER WIDGET

Floating card: `position:fixed; bottom:1.5rem; right:1.5rem; z-index:500`
Appears 8 seconds after dashboard loads.
Shows after radio button selection → confirmation text → auto-hides after 2.5s.
3 radio options: Every Monday / Every Friday (default checked) / Every Sunday.

---

## 🍞 TOAST NOTIFICATION

`position:fixed; bottom:2rem; left:50%; transform:translateX(-50%)` — slides up with opacity.
Green border. Shows "✅ Analysis summary copied to clipboard!" for 3 seconds.
Triggered by shareAnalysis() and approveItem().

---

## ✈️ CAREER PASSPORT (Print)

Opens a new window with a clean white HTML document.
Sections: Student header, Career Path Analysis Summary table, SMAART Recommendation box, Combined Priority Learning Path table, Recommended Certifications table.
Calls `window.print()` after 500ms delay.

---

## ⚡ COMPLETE JAVASCRIPT FUNCTION REFERENCE

| Function | Purpose |
|---|---|
| `updateStepUI()` | Updates step indicator, shows/hides Back/Next/Submit buttons |
| `nextStep()` | Advances form step |
| `prevStep()` | Goes back one step |
| `addSkill()` | Adds skill tag from input |
| `quickAdd(s)` | Adds skill from quick-add chips |
| `removeSkill(s)` | Removes skill tag |
| `renderTags()` | Renders all skill tags |
| `loadSample()` | Fills form with Priya Sharma sample data |
| `startAnalysis()` | Starts loading screen → dashboard flow |
| `showScreen(id)` | Switches between all 5 screens |
| `showAdminScreen()` | Shows admin dashboard |
| `showPOScreen()` | Shows PO dashboard |
| `setRole(idx, el)` | Switches active career path tab + updates sidebar indicator |
| `switchSub(idx)` | Switches sidebar panel + updates active sidebar item |
| `updateSbIndicator(idx)` | Updates the role dot + name in sidebar header |
| `animateBars()` | Animates all progress bars in active role panel |
| `animateOverviewBars()` | Specifically animates overview hero cards + ML score bars |
| `rateStar(roleIdx, n)` | Sets star rating for a role |
| `setRegion(region, el)` | Updates region box with salary/jobs/growth data |
| `shareAnalysis()` | Copies text summary to clipboard + shows toast |
| `printPassport()` | Opens print window with career passport |
| `markRm(role, item, status)` | Toggles roadmap item done/in-progress |
| `approveItem(btn)` | Approves admin queue item |
| `rejectItem(btn)` | Rejects admin queue item |
| `setReminder()` | Shows reminder confirmation + hides widget |
| `openModal(title, body)` | Opens modal with dynamic content |
| `closeModal()` | Closes modal |
| `closeModalOutside(e)` | Closes modal when clicking overlay |
| `openZoneModal(type, role)` | Opens zone detail modal |
| `openSkillModal(name, priority, have, key)` | Opens skill detail modal |
| `openAIToolModal(name, priority, cost, desc, links)` | Opens AI tool modal |
| `openCertModal(name, issuer, cost, validity, format, url, why)` | Opens cert modal |
| `openRoadmapModal(month, title, hrs)` | Opens roadmap detail modal |
| `openProjectModal(title, level, desc, tags, timeline, learning)` | Opens project modal |
| `openResModal(title, platform, type, desc, url)` | Opens resource modal |
| `toggleTheme()` | Toggles dark/light mode + saves to localStorage |
| `toggleSbCollapse()` | Opens/closes Analysis Tools section in sidebar |

---

## 📱 RESPONSIVE BREAKPOINT (max-width: 768px)

- All grids collapse to `1fr` (single column)
- Sidebar: `display:none`
- Nav links: `display:none`
- Role buttons: wrap
- Comparison table: smaller font + padding

---

## 🗂️ DATA ARCHITECTURE

### 3 Career Paths (Sample: Priya Sharma, MCA — Computer Science)

| | Cloud Engineer | Data Analyst | Frontend Developer |
|---|---|---|---|
| ML Score | 67% (mid/amber) | 78% (high/green) | 31% (low/red) |
| Education Zone | Amber 42% | Green 68% | Amber 35% |
| Skills Zone | Green 55% | Green 72% | Red 28% |
| Experience Zone | Amber 40% | Amber 55% | Red 15% |
| Prep Time | 4–6 months | 2–3 months | 6–9 months |
| India Salary | ₹8–20 LPA | ₹4–12 LPA | ₹5–18 LPA |
| Market Demand | High 28% CAGR | Very High 35% | High 22% |
| AI Auto Risk | Medium 30% | Medium 40% | Medium 35% |

### Roadmap Months

**Cloud Engineer (6 months):**
M1: Foundation & Prerequisites — 45 hrs
M2: Core Skills (Terraform, K8s, CI/CD) — 60 hrs
M3: Monitoring, Logging & Secondary Tools — 50 hrs
M4: AI-Augmented Cloud Workflows — 40 hrs
M5: Capstone Project & Open Source — 80 hrs
M6: Interview Prep & Market Entry — 30 hrs

**Data Analyst (3 months):**
M1: Deepen SQL + Learn Power BI — 55 hrs
M2: Python for Analytics + Statistics — 50 hrs
M3: Portfolio + Interview Prep — 60 hrs

**Frontend Developer (8 months/4 phases):**
M1-2: JavaScript Deep Dive + CSS Mastery — 90 hrs
M3-4: React + TypeScript + Next.js — 80 hrs
M5-6: Portfolio Projects + Testing — 100 hrs
M7-8: Interview Prep + Job Applications — 60 hrs

### Skill Overlap Data (for Tab 9)
ALL 3 paths: Python, SQL, Git/GitHub
2 paths: Linux/Bash (Cloud+Data), GitHub Copilot (Cloud+FE), Docker (Cloud+FE)
Primary only: AWS/Cloud Core
Secondary only: Power BI/Tableau
Tertiary only: React.js + TypeScript

### Panel ID Map (subMap array)
```js
subMap = [
  ['r0p0','r0p1','r0p2','r0p3','r0p4','r0p5','r0p6','r0p7','r0p8','r0p9','r0p10'],
  ['r1p0','r1p1','r1p2','r1p3','r1p4','r1p5','r1p6','r1p7','r1p8','r1p9','r1p10'],
  ['r2p0','r2p1','r2p2','r2p3','r2p4','r2p5','r2p6','r2p7','r2p8','r2p9','r2p10']
]
```
Panels 8 and 9 for roles 1 and 2 are cloned from role 0 (Compare Paths and Skill Overlap are global).

---

## 🎨 ANIMATION RULES

1. **Page load bars:** All `.mbar-fill`, `.oh-bar-fill`, `.ml-progress-fill` start at width:0. Set `data-w="XX%"` on element. On display: set to 0, setTimeout 80-100ms, then set to `data-w` value. CSS handles the smooth transition.

2. **Step indicator animation:** On step change, `fadeIn` keyframe: `from {opacity:0; transform:translateX(8px)} to {opacity:1; transform:translateX(0)}` — 0.3s ease.

3. **Sub-panel animation:** Same `fadeIn` 0.25s ease on `.sub-panel.active`.

4. **Sidebar collapse:** CSS transition `max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s`. Toggle by adding/removing class `.open`.

5. **Card hover:** `transform: translateY(-2px)` + `box-shadow: 0 8px 24px rgba(0,0,0,0.3)` — 0.25s transition.

6. **Modal open:** opacity 0→1 (overlay), scale 0.95→1 (modal box) — 0.25s transition.

7. **Pulse dot (nav meta):** `@keyframes pulse {0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)}}` 2s infinite.

8. **Loading dot pulse:** `@keyframes ldPulse {0%,100%{box-shadow:0 0 0 0 rgba(79,142,247,.5)} 50%{box-shadow:0 0 0 8px rgba(79,142,247,0)}}` 1s infinite.

---

## 📝 THE MASTER PROMPT (Copy This to Any AI)

```
Build a single-file HTML/CSS/JS career intelligence platform called SMAART. 
No frameworks, no npm, no build tools — one .html file that opens in any browser.

DESIGN SYSTEM:
- Font: Plus Jakarta Sans (300-800 weights) + Instrument Serif (italic only for hero heading)
- Load from Google Fonts
- Dark navy background: #060e1f
- Primary accent: #4f8ef7 (blue), #22d3ee (cyan), #a78bfa (purple)
- Status colors: #10b981 (green), #f59e0b (amber), #ef4444 (red)  
- Text: #eef2ff primary, #c7d2f0 secondary, #6b7fa8 muted
- Cards: rgba(17,31,61,0.95)
- Borders: rgba(255,255,255,0.07) default, rgba(255,255,255,0.14) hover
- Background: two subtle radial gradient blobs + 48px dot grid pattern
- Light mode toggled via body.light-mode class, saved to localStorage

SCREENS (5 total, shown/hidden by display property):
1. Onboarding form — 6-step wizard, max-width 820px
2. Loading screen — animated progress with 6 step items + progress bar
3. Main dashboard — 3 career paths × 11 content tabs each
4. Admin dashboard — KPIs, approval queue, analytics
5. PO dashboard — batch analytics for placement officers

NAV (fixed, 56px height):
- Logo: SMAART with accent "A" + BETA badge
- Links: Home (→ onboarding), Market Insights (→ dashboard tab 1), Career Passport (→ print), Admin, PO View — ALL functional
- Right: theme toggle (dark/light) + Login + View Dashboard button

DASHBOARD HEADER:
- "Welcome back, [Name]" with gradient name + pulsing green meta dot
- Two header buttons: Share + Passport
- 3 role tabs with zone color dots (amber/green/red)

SIDEBAR (210px, sticky, navy2 background):
- Role indicator pill at top (updates on tab switch)
- 8 main nav items with SVG icons (no emojis)
- Divider + collapsible "Analysis Tools" section with chevron toggle
- Items 8/9/10: Compare Paths, Skill Overlap, Resume Tips
- Footer: Share Analysis button
- Collapse animates with max-height + opacity transition

ROLE OVERVIEW TAB (the hero panel):
- Region box with flag buttons (India/USA/UK/UAE/Canada/Australia) + demand badge
- 3 salary/jobs/growth stats update when region changes
- ML Score banner: large colored number + description + animated progress bar
- 3 zone cards (amber/green gradient tinted) with large % + bar + insight text
- Role Intel 2×2 grid: employers, prep time, entry paths, growth path
- Emerging roles chip strip

ALL CONTENT TABS:
- Tab 1: Market Intel — 4 stat grid + 4 info cards + human skills chips
- Tab 2: Tech Skills — skill cards with have/need icons, priority badges, click → modal
- Tab 3: AI Tools — tool cards with priority badges, click → modal  
- Tab 4: Roadmap — numbered items with In Progress/Done toggle buttons + cert grid + star rating
- Tab 5: Projects — 2-col cards, click → modal with tech stack details
- Tab 6: Resources — FREE/PAID/CERT PREP tagged cards, click → modal with URLs
- Tab 7: Job Search — clickable portal links + application tips box
- Tab 8: Compare Paths — HTML table comparing all 3 paths, winner cells in green
- Tab 9: Skill Overlap — visual grid showing which skills appear in how many paths
- Tab 10: Resume Tips — 2-col tip cards with example boxes

MODALS:
- Fixed overlay with blur backdrop
- 18px border radius, scale animation
- 3-color gradient top bar
- Sticky top bar with close button
- Types: zone, skill, AI tool, cert, roadmap, project, resource

SAMPLE DATA (3 paths for MCA student "Priya Sharma"):
- Cloud Engineer: 67% ML score, Amber zone (Education 42%, Skills 55%, Experience 40%)
- Data Analyst: 78% ML score, Green zone (Education 68%, Skills 72%, Experience 55%)  
- Frontend Developer: 31% ML score, Red zone (Education 35%, Skills 28%, Experience 15%)

FEATURES:
- Theme toggle (dark/light) saved to localStorage
- Loading screen with 6 animated steps and progress bar
- Roadmap progress tracker (toggle done/in-progress per item, persists in JS state)
- Region selector updating salary/jobs/growth data live
- Share Analysis (clipboard copy + slide-up toast notification)
- Career Passport (opens printable HTML in new window)
- Admin dashboard with approve/reject queue
- PO dashboard with batch analytics
- Floating reminder widget (appears 8s after dashboard loads)
- All bars animate (start at 0, animate to target width on display)
```

---

## ⚠️ COMMON MISTAKES TO AVOID

1. **Never wrap all JS in DOMContentLoaded** — the `<script>` tag is at bottom of `<body>`, so DOM is already parsed. Inline `onclick` handlers need functions in global scope.

2. **Always use `data-w="XX%"` on bar fills** — not inline width. The animation function reads this attribute.

3. **subMap panels 8 and 9 for roles 1 and 2 are cloned from role 0** — they contain placeholder divs that get innerHTML copied from `r0p8` and `r0p9` on first visit.

4. **Sidebar items use explicit `onclick="switchSub(N)"` in HTML** — NOT dynamically attached by forEach index (which breaks with the new sidebar structure).

5. **The region box is INSIDE the overview panel (r0p0)**, NOT in the dashboard header.

6. **Screen height** is calculated as `calc(100vh - 56px)` for sticky sidebar (56px = nav height).

7. **Always close `</script></body></html>`** — truncated files cause `nextStep is not defined` errors.

---

*This document covers 100% of the SMAART v7 platform. Use it as your single source of truth.*
