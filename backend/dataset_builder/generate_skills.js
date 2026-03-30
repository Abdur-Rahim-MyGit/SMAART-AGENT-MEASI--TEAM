const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const KEY = process.env.OPENROUTER_API_KEY;
const OUT = path.join(__dirname, '../data/role_skills_db.json');
const ROLES_FILE = path.join(__dirname, '../data/job_roles.json');

// Ensure data exists
if (!fs.existsSync(OUT)) {
  fs.writeFileSync(OUT, JSON.stringify({}, null, 2));
}

let db = JSON.parse(fs.readFileSync(OUT, 'utf8'));

// If job_roles.json is missing, provide a core set from common Indian market
let roles = [];
if (fs.existsSync(ROLES_FILE)) {
    roles = JSON.parse(fs.readFileSync(ROLES_FILE, 'utf8'));
} else {
    console.warn("⚠️ Warning: job_roles.json missing. Using common core roles for generation.");
    roles = [
        { role_name: "Financial Analyst", job_family: "Finance" },
        { role_name: "Audit Associate", job_family: "Finance" },
        { role_name: "Python Developer", job_family: "Engineering" }
    ];
}

const uncovered = roles.filter(r => !db[r.role_name]);

// Group by family — process 4 roles per call for maximum efficiency
const byFamily = {};
uncovered.forEach(r => {
  if (!byFamily[r.job_family]) byFamily[r.job_family] = [];
  byFamily[r.job_family].push(r.role_name);
});

async function generate(family, batch) {
  const prompt = `You are an Indian workforce expert 2025-2026.
Family: ${family}
Roles: ${batch.join(', ')}

Return ONLY a valid JSON object map of tech_skills and ai_tools per role. No explanation.

Example Format:
{
  "Financial Analyst": {
    "tech_skills": [
      { "skill_name": "Excel", "priority": "CRITICAL", "where_to_learn": "Microsoft Learn" }
    ],
    "ai_tools": [
      { "tool_name": "ChatGPT", "used_for": "Reporting", "priority": "HIGH" }
    ]
  }
}`;

  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions',
      { 
        model: 'mistralai/mistral-7b-instruct:free', 
        messages: [{ role: 'user', content: prompt }], 
        max_tokens: 3000 
      },
      { 
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, 
        timeout: 45000 
      }
    );
    
    const content = res.data.choices[0].message.content;
    const jsonStr = content.match(/\{[\s\S]*\}/)[0];
    const json = JSON.parse(jsonStr);
    
    Object.keys(json).forEach(role => { 
        db[role] = json[role]; 
    });
    
    fs.writeFileSync(OUT, JSON.stringify(db, null, 2)); // Auto-save after every batch
    return Object.keys(json).length;
  } catch(e) { 
    console.error(`❌ FAILED for batch ${batch}: ${e.message}`); 
    return 0; 
  }
}

// Progress Engine
(async () => {
  console.log(`🚀 Starting Skill Database Expansion for ${uncovered.length} roles...`);
  
  for (const [family, rlist] of Object.entries(byFamily)) {
    console.log(`\n📂 Sector: ${family} (${rlist.length} roles)`);
    for (let i = 0; i < rlist.length; i += 4) {
      const batch = rlist.slice(i, i+4);
      const n = await generate(family, batch);
      if (n > 0) {
        console.log(` ✅ ${n} roles updated | Current Total: ${Object.keys(db).length}`);
      }
      await new Promise(r => setTimeout(r, 2000)); // Respect free tier rate limits
    }
  }
  console.log(`\n🏆 Process Complete. Database now contains ${Object.keys(db).length} roles.`);
})();
