const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

async function getMLEnrichment(studentData, roleName, roleData) {
  try {
    // Step 1: Use extracted skills from resume text if available, else join skills array
    const skillText = (studentData.skills || []).join(', ');
    
    let semanticSkills = studentData.skills || [];
    try {
      const parseRes = await axios.post(`${ML_URL}/parse-resume`, { text: skillText }, { timeout: 6000 });
      if (parseRes.data?.extracted_skills?.length > 0) {
        semanticSkills = parseRes.data.extracted_skills;
      }
    } catch (e) {
      console.warn('[ML /parse-resume] Unavailable:', e.message);
    }

    // Step 2: Build features for success prediction
    // features = [skill_match_count, degree_relevance_score (0-10), market_demand_score (0-10)]
    const requiredSkills = (roleData?.tech_skills || []).map(s => s.skill_name.toLowerCase());
    const skillMatchCount = semanticSkills.filter(ss =>
      requiredSkills.some(rs => rs.includes(ss.toLowerCase()) || ss.toLowerCase().includes(rs))
    ).length;
    const degreeScore = 5; // default middle score — can be refined later
    const demandScore = 7; // default — will be replaced when market_data.json exists

    let successProbability = null;
    try {
      const predRes = await axios.post(`${ML_URL}/predict-success`,
        { features: [skillMatchCount, degreeScore, demandScore] },
        { timeout: 6000 }
      );
      successProbability = predRes.data?.success_probability || null;
    } catch (e) {
      console.warn('[ML /predict-success] Unavailable:', e.message);
    }

    return { semanticSkills, successProbability };
  } catch (e) {
    console.warn('[ML ENRICHMENT] Failed gracefully:', e.message);
    return { semanticSkills: studentData.skills || [], successProbability: null };
  }
}


let roleSkillsDB = {};
try {
  roleSkillsDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/role_skills_db.json'), 'utf8'));
  
  let compiledRoles = {};
  if (fs.existsSync(path.join(__dirname, 'data/compiled_roles.json'))) {
      compiledRoles = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/compiled_roles.json'), 'utf8'));
  }
  
  for(const [rName, rData] of Object.entries(compiledRoles)) {
    if(!roleSkillsDB[rName]) roleSkillsDB[rName] = { tech_skills: [], ai_tools: [] };
    
    roleSkillsDB[rName].compiled = rData;
    
    // Support both 'domain_skills' and 'technical_skills' naming from different data sources
    const incomingSkills = rData.domain_skills || rData.technical_skills;
    if(incomingSkills) {
       roleSkillsDB[rName].tech_skills = incomingSkills.map(ts => ({
          skill_name: ts.skill_name || ts.name, priority: ts.importance || ts.priority || "High"
       }));
    }
    
    // Support 'ai_skills' or 'ai_tools' naming
    const incomingAI = rData.ai_skills || rData.ai_tools;
    if(incomingAI) {
       roleSkillsDB[rName].ai_tools = incomingAI.map(as => ({
          tool_name: as.skill_name || as.tool_name || as.name, 
          priority: as.importance || as.priority || "Medium", 
          used_for: as.used_for || "Task Acceleration"
       }));
    }
  }

} catch (err) {
  console.warn("Could not load role databases:", err.message);
}

let zoneMatrix = {};
try {
  const zmPath = path.join(__dirname, 'data', 'zone_matrix.json');
  if (fs.existsSync(zmPath)) zoneMatrix = JSON.parse(fs.readFileSync(zmPath, 'utf8'));
} catch (err) { console.warn('zone_matrix.json not loaded:', err.message); }

let marketData = {};
try {
  const mdPath = path.join(__dirname, 'data', 'market_data.json');
  if (fs.existsSync(mdPath)) marketData = JSON.parse(fs.readFileSync(mdPath, 'utf8'));
} catch (err) { console.warn('market_data.json not loaded:', err.message); }

function getZoneFromMatrix(degreeGroup, roleName) {
  if (!zoneMatrix || !zoneMatrix[degreeGroup]) return null;
  return zoneMatrix[degreeGroup][roleName] || null;
}

function getMarketFromData(roleName) {
  if (!marketData) return null;
  return marketData[roleName] || null;
}

// Helper: Count matching keywords
const countKeywordMatches = (text, keywords) => {
  if (!text || !keywords || !keywords.length) return 0;
  const lowerText = text.toLowerCase();
  return keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length;
};

// ALGORITHM 1: Direction Scoring
// Scores how well a student's profile matches a Specific Role (0.0 to 1.0)
const calculateDirectionScore = (studentData, roleName, roleData) => {
  let score = 0;
  
  // 1. Degree Match (Weight: 35%)
  const eduArray = Array.isArray(studentData.education) ? studentData.education : (studentData.education ? [studentData.education] : []);
  const studentDegreesText = eduArray.map(e => {
    if (!e) return "";
    const group = (e.degreeGroup || "").toLowerCase();
    const specs = Array.isArray(e.specialisation) ? e.specialisation.join(" ") : (e.specialisation || "");
    return `${group} ${specs.toLowerCase()}`;
  }).join(" ");
  
  const roleKeywords = (roleName || "").split(' ');
  const degreeMatches = countKeywordMatches(studentDegreesText, roleKeywords);
  score += Math.min(degreeMatches * 0.15, 0.35); // Max 35%

  // 2. Skill Match (Weight: 45%) - Heaviest Weight
  const requiredTechSkills = (roleData.tech_skills || []).map(s => s.skill_name.toLowerCase());
  const studentSkills = Array.isArray(studentData.skills) ? studentData.skills : [];
  
  const skillMatches = studentSkills.filter(s => {
    const sName = (typeof s === 'string' ? s : s.name || "").toLowerCase();
    return requiredTechSkills.some(rs => rs.includes(sName) || sName.includes(rs));
  }).length;
  
  const skillMatchRatio = requiredTechSkills.length > 0 ? (skillMatches / requiredTechSkills.length) : 0;
  score += Math.min(skillMatchRatio * 0.45, 0.45);

  // 3. Experience Match (Weight: 20%)
  const expArray = Array.isArray(studentData.experience) ? studentData.experience : [];
  if (expArray.length > 0) {
    const expText = expArray.map(ex => `${(ex.designation || "").toLowerCase()} ${(ex.sector || "").toLowerCase()}`).join(" ");
    const expMatches = countKeywordMatches(expText, roleKeywords);
    score += Math.min(expMatches * 0.1, 0.20);
  }

  return score;
};

// ALGORITHM 2 & 3: Role Distance & Skill Priority Ranking
const calculateSkillGaps = (studentSkillsArr, roleData) => {
  const studentSkillsLower = studentSkillsArr.map(s => (typeof s === 'string' ? s : s.name || "").toLowerCase());
  
  const missingSkills = [];
  const mathingSkills = [];

  (roleData.tech_skills || []).forEach(skill => {
    const sName = skill.skill_name.toLowerCase();
    const isMatched = studentSkillsLower.some(ss => ss.includes(sName) || sName.includes(ss));
    if (isMatched) {
      mathingSkills.push(skill.skill_name);
    } else {
      missingSkills.push(skill);
    }
  });

  return { missingSkills, mathingSkills };
};

const determineZone = (score) => {
  if (score >= 0.6) return { zone: "Green", msg: "Strong alignment based on current skills and education." };
  if (score >= 0.3) return { zone: "Amber", msg: "Moderate alignment. You need to bridge specific skill gaps." };
  return { zone: "Red", msg: "This role usually requires a different background. Extra preparation required." };
};

const generateRoleTab = (roleName, studentData) => {
  // Find case-insensitive role match, prioritizing those with compiled data
  const keys = Object.keys(roleSkillsDB);
  const matchedKey = keys.find(k => k.toLowerCase() === roleName.toLowerCase() && roleSkillsDB[k].compiled) 
                 || keys.find(k => k.toLowerCase() === roleName.toLowerCase());
                 
  const roleData = matchedKey ? roleSkillsDB[matchedKey] : {
    tech_skills: [{skill_name: "Domain Knowledge", priority: "High"}],
    ai_tools: [{tool_name: "ChatGPT", priority: "Medium", used_for: "General Assistance"}]
  };

  const score = calculateDirectionScore(studentData, roleName, roleData);
  const { zone, msg } = determineZone(score);
  
  const { missingSkills, mathingSkills } = calculateSkillGaps(studentData.skills, roleData);
  
  // Format Must Have / Nice to have
  const mustHave = roleData.tech_skills
    .filter(s => s.priority === "High" || s.priority === "Critical")
    .map(s => ({ skill: s.skill_name, priority: s.priority, description: "Essential core skill." }));
    
  const niceToHave = roleData.tech_skills
    .filter(s => s.priority === "Medium" || s.priority === "Low")
    .map(s => s.skill_name);

  const aiTools = roleData.ai_tools.map(t => ({
    name: t.tool_name,
    category: "AI-Powered",
    usage: t.used_for,
    adoption_level: "Growing"
  }));

  const compiled = roleData.compiled || {};

  // ─── Build richer data from audited compiled fields ──────────────────────
  // Salary range: prefer salary_progression, fallback to low/high
  let salaryDisplay = "3-8 LPA";
  if (compiled.salary_progression) {
    const sp = compiled.salary_progression;
    salaryDisplay = sp.year_0_1 || salaryDisplay;
  } else if (compiled.salary_range_low) {
    salaryDisplay = `₹${(compiled.salary_range_low/100000).toFixed(1)}L - ₹${(compiled.salary_range_high/100000).toFixed(1)}L`;
  }

  // Typical employers: build from job_family if available
  const jobFamily = compiled.job_family || compiled.job_family_name || "";
  let typicalEmployers = "MNCs, Startups, Consultancies";
  if (jobFamily.toLowerCase().includes("finance") || jobFamily.toLowerCase().includes("bank")) {
    typicalEmployers = "Banks, NBFCs, Audit Firms, Fintech Companies";
  } else if (jobFamily.toLowerCase().includes("technology") || jobFamily.toLowerCase().includes("software")) {
    typicalEmployers = "MNCs, IT Product Companies, Startups, IT Services";
  } else if (jobFamily.toLowerCase().includes("healthcare")) {
    typicalEmployers = "Hospitals, Pharma Companies, Diagnostics Chains";
  } else if (jobFamily.toLowerCase().includes("hr") || jobFamily.toLowerCase().includes("people")) {
    typicalEmployers = "Corporates, Consulting Firms, BPOs, MNCs";
  } else if (jobFamily.toLowerCase().includes("sales") || jobFamily.toLowerCase().includes("marketing")) {
    typicalEmployers = "FMCG, D2C Brands, Agencies, E-Commerce Companies";
  } else if (jobFamily.toLowerCase().includes("engineering") || jobFamily.toLowerCase().includes("manufacturing")) {
    typicalEmployers = "Manufacturing Plants, PSUs, EPC Companies, Auto OEMs";
  }

  // Common entry paths: based on programme levels
  const progLevels = compiled.programme_levels || "";
  let entryPaths = "Campus Placements, Internships";
  if (progLevels.includes("MBA")) {
    entryPaths = "Campus Placements, MBA Internships, Lateral Hiring";
  } else if (progLevels.includes("PG")) {
    entryPaths = "Campus Placements, Postgraduate Internships";
  }

  // AI exposure label
  const aiPct = compiled.ai_exposure_pct || 40;
  let aiDemandLabel = "Moderate Growth";
  if (aiPct >= 70) aiDemandLabel = "High AI-Disruption Zone";
  else if (aiPct >= 50) aiDemandLabel = "Actively AI-Evolving";
  else aiDemandLabel = "Stable with AI Augmentation";

  return {
    zone: zone,
    zone_message: msg,
    preparation_time: zone === "Green" ? "1-2 months" : zone === "Amber" ? "3-5 months" : "6+ months",
    match_explanation: `Your alignment score is ${(score*100).toFixed(0)}%. You have ${mathingSkills.length} matching skills.`,
    tab1: {
      role_name: compiled.role_name || roleName,
      job_family: jobFamily,
      role_description: compiled.narrative_para1 || `Responsible for core operations within the ${roleName} domain.`,
      narrative_para1: compiled.narrative_para1 || `Responsible for core operations within the ${roleName} domain.`,
      narrative_para2: compiled.narrative_para2 || `AI systems are augmenting ${roleName} roles significantly.`,
      narrative_para3: compiled.narrative_para3 || `${roleName} professionals are entering a high-growth phase. Those with AI tool proficiency and cross-functional skills will thrive. Eligible programme levels: ${progLevels || "UG, PG"}.`,
      typical_employers_india: typicalEmployers,
      common_entry_paths: entryPaths,
      job_demand: aiDemandLabel,
      salary_range: salaryDisplay,
      salary_progression: compiled.salary_progression || null,
      english_requirement: compiled.english_requirement || "Important",
      remote_friendly: compiled.remote_friendly || "Office-Based",
      emerging_role_flag: compiled.emerging_role_flag || false,
      programme_levels: progLevels,
      ai_exposure_pct: aiPct,
      ai_impact: compiled.narrative_para2 || `AI tools are reshaping ${roleName} roles. ${aiPct}% of routine tasks are now AI-assisted.`,
      emerging_roles: [{name: `AI-Enhanced ${roleName}`, description: `Uses ${aiPct >= 55 ? 'GitHub Copilot, ChatGPT' : 'AI productivity tools'} daily.`}]
    },
    tab2: { must_have: mustHave, nice_to_have: niceToHave },
    tab3: {
      ai_tools: aiTools.length ? aiTools : [{name: "ChatGPT", category: "AI-Powered", usage: "General Assistance", adoption_level: "High"}],
      ai_exposure: {
        percentage: aiPct + "%",
        level: compiled.ai_exposure_level || (aiPct >= 60 ? "High" : aiPct >= 40 ? "Medium" : "Low"),
        tasks_assisted: compiled.ai_exposure_detail || "Repetitive and structured tasks",
        human_value: compiled.human_value_tasks || "Strategic judgment, stakeholder communication, creative problem-solving"
      },
      human_skills: compiled.foundational_skills
        ? compiled.foundational_skills.map(f => f.skill_name)
        : ["Analytical Thinking", "Communication", "Problem Solving", "Continuous Learning"]
    },
    tab4: {
      skill_gap: {
        current_skills: studentData.skills.length ? (studentData.skills.map(s => s.name || s)) : ["Basic Academics", "Communication"],
        missing_skills: missingSkills.map(m => m.skill_name)
      },
      learning_roadmap: [
        { step: "Step 1 - Foundation Skills", description: `Master the prerequisites for ${roleName}.` },
        { step: "Step 2 - Core Technical Skills", description: `Learn ${missingSkills[0]?.skill_name || 'essential technologies'} for this role.` },
        { step: "Step 3 - Advanced Applications", description: `Deep dive into ${missingSkills[1]?.skill_name || 'advanced specialisations'}.` },
        { step: "Step 4 - Projects & Portfolio", description: `Build a ${roleName} portfolio.` }
      ],
      certifications: [
        {name: `Industry Certified ${roleName}`, issuer: "Accredited Provider", difficulty: "Intermediate", duration: "3-4 months"}
      ],
      projects: [
        {project_name: `${roleName} Capstone`, description: `Complete ${roleName} end-to-end project.`, skills_demonstrated: missingSkills.slice(0, 3).map(s=>s.skill_name).join(', ')}
      ]
    },
    tab5: {
      future_scope: compiled.narrative_para3 || `${roleName} is evolving with AI integration across ${jobFamily || "the industry"}.`,
      target_audience: `${progLevels || "UG/PG"} graduates with interest in ${jobFamily || roleName}.`,
      growth_trajectory: compiled.salary_progression
        ? `Entry: ${compiled.salary_progression.year_0_1 || "3-6 LPA"} → Mid: ${compiled.salary_progression.year_2_3 || "7-12 LPA"} → Senior: ${compiled.salary_progression.year_4_5 || "12-20 LPA"} → Lead: ${compiled.salary_progression.year_6_plus || "20+ LPA"}`
        : "Steady upward growth trajectory with specialisation."
    }
  };
};

/**
 * processCareerIntelligence: Deterministic deep intelligence processor.
 * Completely replaces the old LLM runtime calls with local Rule Engine calculations.
 */
const processCareerIntelligence = async (studentData) => {
  const { preferences, skills } = studentData;
  const primaryRole = preferences.primary?.role || preferences.primary?.jobRole || "Target Role";
  const pRole = primaryRole;
  const sRole = preferences.secondary?.role || preferences.secondary?.jobRole || "Secondary Role";
  const tRole = preferences.tertiary?.role || preferences.tertiary?.jobRole || "Tertiary Role";

  const primaryTab = generateRoleTab(pRole, studentData);
  const secondaryTab = generateRoleTab(sRole, studentData);
  const tertiaryTab = generateRoleTab(tRole, studentData);

  let mlEnrichment = { semanticSkills: [], successProbability: null };
  try {
    const pRoleDataForML = roleSkillsDB[pRole] || { tech_skills: [] };
    mlEnrichment = await getMLEnrichment(studentData, pRole, pRoleDataForML);
  } catch (e) {}

  // Calculate missing skills across the primary role for the roadmap
  const pRoleData = roleSkillsDB[pRole] || { tech_skills: [] };
  const { missingSkills, mathingSkills } = calculateSkillGaps(skills, pRoleData);

  const degreeGroup = studentData.education?.[0]?.degreeGroup || studentData.education?.degreeGroup || '';

  // Try zone_matrix.json first (Member 2's data — more accurate)
  // Fall back to generateRoleTab() zone score (always available)
  const zoneFromMatrix = getZoneFromMatrix(degreeGroup, pRole);
  const marketFromData = getMarketFromData(pRole);

  const preVerified = {
    dataFilesReady: Object.keys(zoneMatrix).length > 0,
    primaryZone: zoneFromMatrix || { employer_zone: primaryTab.zone, skill_coverage_pct: 0 },
    secondaryZone: getZoneFromMatrix(degreeGroup, sRole) || { employer_zone: secondaryTab.zone },
    tertiaryZone: getZoneFromMatrix(degreeGroup, tRole) || { employer_zone: tertiaryTab.zone },
    primaryMarket: marketFromData || null,
    primarySkillGap: {
      missing: missingSkills.map(m => m.skill_name),
      matched: mathingSkills,
      coveragePct: (missingSkills.length + mathingSkills.length) > 0
        ? Math.round((mathingSkills.length / (missingSkills.length + mathingSkills.length)) * 100)
        : 0,
      dataReady: true,
      source: 'local'
    }
  };

  // Calculate skill coverage % for fallback zone
  const preVerified_skillCoverage = preVerified.primarySkillGap.coveragePct;
  // Fix: update fallback primaryZone with real coverage now that we have it
  if (!zoneFromMatrix) {
    preVerified.primaryZone.skill_coverage_pct = preVerified_skillCoverage;
  }

  const probStr = mlEnrichment.successProbability ? Math.round(mlEnrichment.successProbability * 100) + '%' : 'Calculating';

  return {
    status: mlEnrichment.semanticSkills.length > 0 ? 'success_ml_assisted' : 'success_deterministic',
    generated_at: new Date().toISOString(),
    preVerified,
    primary: primaryTab,
    secondary: secondaryTab,
    tertiary: tertiaryTab,
    ml_success_probability: mlEnrichment.successProbability,
    ml_semantic_skills: mlEnrichment.semanticSkills,
    combined_tab4: {
      combined_pathway_summary: `Your immediate focus must be learning the missing fundamentals for ${pRole}. Role success probability: ${probStr}`,
      skill_gap: {
        current_skills: skills.length ? skills : ["Basic Academics", "Communication"],
        missing_skills: preVerified.primarySkillGap.missing
      },
      learning_roadmap: [
        { step: "Step 1 - Foundation Skills", description: "Master prerequisites and theoretical fundamentals." },
        { step: "Step 2 - Core Technical Skills", description: `Learn ${missingSkills[0]?.skill_name || 'core technologies'}.` },
        { step: "Step 3 - Advanced Applications", description: "Apply skills in complex scenarios." },
        { step: "Step 4 - Projects & Portfolio", description: "Deploy market-ready portfolios demonstrating these skills." }
      ],
      certifications: [
        {name: `Certified ${pRole} Professional`, issuer: "Industry Standard Provider", difficulty: "Intermediate", duration: "3 months"}
      ],
      free_courses: [
        {course_name: `${pRole} Crash Course`, platform: "YouTube / Coursera", link_status: "Free"}
      ],
      projects: [
        {project_name: `${pRole} Capstone`, description: "A complete end-to-end implementation.", skills_demonstrated: missingSkills.slice(0, 3).map(s=>s.skill_name).join(', ')}
      ]
    }
  };
};

module.exports = { processCareerIntelligence, calculateDirectionScore, calculateSkillGaps, determineZone };
