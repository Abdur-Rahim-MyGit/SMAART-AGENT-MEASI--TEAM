/**
 * SMAART Career Intelligence Platform
 * Data Merge Script — Compiles all audited Documentation JSONs into:
 *   1. backend/data/compiled_roles.json  (Role profiles + Narratives merged by role_name)
 *   2. backend/data/role_skills_db.json  (Enriched with domain_skills, technical_skills, ai_skills)
 *
 * Run: node backend/scripts/merge_audited_data.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');  // Career-agent-26-main

const ROLES_DIR      = path.join(ROOT, 'Documentation', 'Job Roles-20260326T111547Z-3-001',      'Job Roles');
const NARRATIVES_DIR = path.join(ROOT, 'Documentation', 'Job Narratives-20260326T111548Z-3-001', 'Job Narratives');
const FAMILIES_DIR   = path.join(ROOT, 'Documentation', 'Job Families-20260326T111551Z-3-001',   'Job Families');

const OUT_COMPILED   = path.join(__dirname, '..', 'data', 'compiled_roles.json');
const OUT_SKILLS_DB  = path.join(__dirname, '..', 'data', 'role_skills_db.json');

// ─── helpers ──────────────────────────────────────────────────────────────────
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`  ❌ Failed to parse: ${filePath}\n     ${e.message}`);
    return null;
  }
}

function loadArrayJsonsFromDir(dir, label) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  console.log(`\n📂 Loading ${label} (${files.length} files)...`);
  const merged = {};
  for (const f of files) {
    const data = readJson(path.join(dir, f));
    if (!data) continue;
    if (Array.isArray(data)) {
      for (const item of data) {
        const key = item.role_name || item.name;
        if (!key) continue;
        merged[key] = { ...(merged[key] || {}), ...item };
      }
      console.log(`  ✅ ${f} — ${data.length} entries`);
    } else if (typeof data === 'object') {
      // Object-keyed format (old compiled_roles.json style)
      for (const [k, v] of Object.entries(data)) {
        merged[k] = { ...(merged[k] || {}), ...v };
      }
      console.log(`  ✅ ${f} — ${Object.keys(data).length} entries (object format)`);
    }
  }
  return merged;
}

// ─── STEP 1: Load all Role Profiles ──────────────────────────────────────────
const roleProfiles = loadArrayJsonsFromDir(ROLES_DIR, 'Job Role Profiles');

// ─── STEP 2: Load all Narratives and merge into role profiles ─────────────────
const narrativeFiles = fs.readdirSync(NARRATIVES_DIR).filter(f => f.endsWith('.json'));
console.log(`\n📂 Loading Narratives (${narrativeFiles.length} files)...`);
for (const f of narrativeFiles) {
  const data = readJson(path.join(NARRATIVES_DIR, f));
  if (!data) continue;
  if (Array.isArray(data)) {
    let count = 0;
    for (const item of data) {
      const key = item.role_name;
      if (!key) continue;
      // Only merge narrative fields, preserve existing role data
      if (!roleProfiles[key]) roleProfiles[key] = {};
      if (item.narrative_para1) roleProfiles[key].narrative_para1 = item.narrative_para1;
      if (item.narrative_para2) roleProfiles[key].narrative_para2 = item.narrative_para2;
      if (item.narrative_para3) roleProfiles[key].narrative_para3 = item.narrative_para3;
      count++;
    }
    console.log(`  ✅ ${f} — ${count} narrative entries merged`);
  }
}

// ─── STEP 3: Write compiled_roles.json ────────────────────────────────────────
console.log(`\n💾 Writing compiled_roles.json...`);
fs.writeFileSync(OUT_COMPILED, JSON.stringify(roleProfiles, null, 2), 'utf8');
console.log(`  ✅ ${Object.keys(roleProfiles).length} roles written to compiled_roles.json`);

// ─── STEP 4: Build role_skills_db.json from the compiled data ─────────────────
console.log(`\n🔧 Building role_skills_db.json...`);

let existingSkillsDB = {};
if (fs.existsSync(OUT_SKILLS_DB)) {
  existingSkillsDB = readJson(OUT_SKILLS_DB) || {};
}

const skillsDB = { ...existingSkillsDB };

for (const [roleName, rData] of Object.entries(roleProfiles)) {
  if (!skillsDB[roleName]) skillsDB[roleName] = {};
  
  // Store the full compiled reference
  skillsDB[roleName].compiled = rData;

  // Map domain_skills or technical_skills → tech_skills
  const domainSkills = rData.domain_skills || rData.technical_skills || [];
  if (domainSkills.length > 0) {
    skillsDB[roleName].tech_skills = domainSkills.map(s => ({
      skill_name: s.skill_name || s.name,
      priority: s.importance || s.priority || 'High'
    }));
  }

  // Map ai_skills → ai_tools
  const aiSkills = rData.ai_skills || [];
  if (aiSkills.length > 0) {
    skillsDB[roleName].ai_tools = aiSkills.map(s => ({
      tool_name: s.skill_name || s.tool_name || s.name,
      priority: s.importance || s.priority || 'Medium',
      used_for: s.used_for || 'Task Acceleration'
    }));
  }

  // Map foundational_skills → soft_skills
  const foundSkills = rData.foundational_skills || [];
  if (foundSkills.length > 0) {
    skillsDB[roleName].soft_skills = foundSkills.map(s => ({
      skill_name: s.skill_name || s.name,
      priority: s.importance || 'High'
    }));
  }
}

fs.writeFileSync(OUT_SKILLS_DB, JSON.stringify(skillsDB, null, 2), 'utf8');
console.log(`  ✅ ${Object.keys(skillsDB).length} roles written to role_skills_db.json`);

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log('✅ MERGE COMPLETE');
console.log(`   📊 Compiled Roles : ${Object.keys(roleProfiles).length}`);
console.log(`   🔧 Skills DB      : ${Object.keys(skillsDB).length}`);

// Check coverage of narratives
const withNarratives = Object.values(roleProfiles).filter(r => r.narrative_para1 && r.narrative_para3).length;
const withoutNarratives = Object.keys(roleProfiles).length - withNarratives;
console.log(`   📝 With Narratives (Para 1+3): ${withNarratives}`);
console.log(`   ⚠️  Without Narratives       : ${withoutNarratives}`);
console.log('═══════════════════════════════════════════════════\n');
