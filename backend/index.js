const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
// records dir
const RECORDS_DIR = path.join(__dirname, 'records');
if (!fs.existsSync(RECORDS_DIR)) fs.mkdirSync(RECORDS_DIR, { recursive: true });

const { roles } = require('./data/mockRoles');
const { generateCareerIntelligence, enhanceWithAI } = require('./services/aiService');
const { processCareerIntelligence } = require('./engine');
const { connectMongoDB, CareerAnalysisModel, UserModel, OTPModel } = require('./mongoDb');
const nodemailer = require('nodemailer');

dotenv.config();

// Prisma Client for Auth
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let redisClient = null;
if (process.env.USE_REDIS === 'true') {
  try {
    const { createClient } = require('redis');
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('[REDIS] Max reconnect attempts reached. Running without cache.');
            return new Error('Redis reconnection failed');
          }
          return 1000;
        }
      }
    });
    redisClient.on('error', (e) => {
      console.warn('[REDIS] Error:', e.message);
      if (redisClient) {
        // Only set to null if it's a terminal error or we want to stop spam
        // But the reconnectStrategy will handle it better.
      }
    });
    redisClient.connect().catch((err) => {
      console.warn('[REDIS] Connection failed:', err.message);
      redisClient = null;
    });
  } catch (e) {
    console.warn('[REDIS] Not available — running without cache');
    redisClient = null;
  }
} else {
  console.log('ℹ️ Redis caching disabled by configuration.');
}

async function getCached(key) {
  if (!redisClient) return null;
  try { return await redisClient.get(key); } catch { return null; }
}
async function setCached(key, value, ttlSeconds = 3600) {
  if (!redisClient) return;
  try { await redisClient.set(key, value, { EX: ttlSeconds }); } catch { }
}
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors());
app.use(express.json());

// Rate Limiting to prevent DDoS and scraping
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for dev testing
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiter specifically to API routes
app.use('/api/', apiLimiter);

// Initialize Databases
connectMongoDB();

// --- API ROUTES ---

// Auth Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Role Check Middleware
function roleCheck(roles) {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

// Helper to send Email (Mockable)
async function sendOTPEmail(email, otp) {
  console.log(`[AUTH] 📧 OTP for ${email}: ${otp}`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'mock_user',
        pass: process.env.SMTP_PASS || 'mock_pass'
      }
    });

    await transporter.sendMail({
      from: '"SMAART Auth" <auth@smaart.io>',
      to: email,
      subject: "Your SMAART Login OTP",
      text: `Your One-Time Password is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your One-Time Password is: ${otp}</b><p>It will expire in 10 minutes.</p>`
    });
    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Email delivery failed (using mock console log only): ${err.message}`);
  }
}

// 0. Authentication (Register / Login)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'STUDENT'
      }
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check MongoDB first (User-specified source)
    let user = await UserModel.findOne({ email });
    let authenticated = false;
    let userId = null;
    let userName = '';
    let userRole = 'student';

    if (user) {
      authenticated = await bcrypt.compare(password, user.password);
      if (authenticated) {
        userId = user._id;
        userName = user.fullName || user.email;
        userRole = user.role || 'student';

        // Update last login in background
        user.lastLogin = new Date();
        user.save().catch(err => console.warn('Failed to update Mongo lastLogin:', err.message));
      }
    }

    // 2. Fallback to Prisma if not found or authenticated in MongoDB
    if (!authenticated) {
      const prismaUser = await prisma.user.findUnique({ where: { email } });
      if (prismaUser) {
        authenticated = await bcrypt.compare(password, prismaUser.passwordHash);
        if (authenticated) {
          userId = prismaUser.id;
          userName = prismaUser.name;
          userRole = prismaUser.role || 'STUDENT';
        }
      }
    }

    if (!authenticated) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to MongoDB
    await OTPModel.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsify: true, new: true, upsert: true }
    );

    // Send OTP
    await sendOTPEmail(email, otp);

    res.json({
      message: 'OTP sent to your email',
      email,
      requiresOTP: true
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const otpRecord = await OTPModel.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // OTP is valid, delete it
    await OTPModel.deleteOne({ _id: otpRecord._id });

    // Fetch user for token
    let user = await UserModel.findOne({ email });
    let userData = null;

    if (user) {
      userData = { id: user._id, name: user.fullName || user.email, role: user.role || 'student' };
    } else {
      const prismaUser = await prisma.user.findUnique({ where: { email } });
      if (prismaUser) {
        userData = { id: prismaUser.id, name: prismaUser.name, role: prismaUser.role || 'STUDENT' };
      }
    }

    if (!userData) return res.status(404).json({ error: 'User not found after OTP verification' });

    // Create and assign token
    const token = jwt.sign(
      { id: userData.id, role: userData.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Verified successfully',
      token,
      user: userData
    });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

// 0b. Student Profile — Save Personal Details (Step 1)
app.post('/api/student/profile', async (req, res) => {
  try {
    const { personalDetails } = req.body;
    if (!personalDetails || !personalDetails.name || !personalDetails.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const { name, email, phone, location } = personalDetails;

    // --- Save / Update in Prisma (SQLite) ---
    let prismaUser = null;
    try {
      // Upsert: if email exists update it, otherwise create a guest profile
      prismaUser = await prisma.user.upsert({
        where: { email },
        update: { name, phone: phone || null, location: location || null },
        create: {
          email,
          name,
          passwordHash: 'GUEST_NO_AUTH',   // guest — no password yet
          role: 'STUDENT',
          phone: phone || null,
          location: location || null
        }
      });
      console.log(`✅ Prisma profile saved: ${email}`);
    } catch (prismaErr) {
      console.warn('⚠️ Prisma upsert skipped (field may not exist yet):', prismaErr.message);
    }

    // --- Save / Update in MongoDB ---
    try {
      const mongo = require('mongoose');
      if (mongo.connection.readyState === 1) {
        const ProfileModel = mongo.models.StudentPersonalProfile ||
          mongo.model('StudentPersonalProfile', new mongo.Schema({
            name: String, email: { type: String, index: true }, phone: String,
            location: String, createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
          }));
        await ProfileModel.findOneAndUpdate(
          { email },
          { name, email, phone, location, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        console.log(`✅ MongoDB profile saved: ${email}`);
      }
    } catch (mongoErr) {
      console.warn('⚠️ MongoDB profile save skipped:', mongoErr.message);
    }

    // --- Safety: also write to local JSON backup ---
    const profilesDir = path.join(__dirname, 'records', 'profiles');
    if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });
    fs.writeFileSync(
      path.join(profilesDir, `profile_${email.replace(/[@.]/g, '_')}.json`),
      JSON.stringify({ name, email, phone, location, savedAt: new Date().toISOString() }, null, 2)
    );

    res.json({
      success: true,
      message: 'Profile saved successfully',
      userId: prismaUser?.id || null
    });
  } catch (err) {
    console.error('Profile save error:', err.message);
    res.status(500).json({ error: 'Failed to save profile', details: err.message });
  }
});

// 1. AI Intelligence Generation (Admin Only)
app.post('/api/admin/generate-role', async (req, res) => {
  const { roleTitle } = req.body;
  const prompt = `Generate a detailed career role profile for "${roleTitle}" in JSON format.`;

  try {
    const intelligence = await generateCareerIntelligence(prompt);
    const cleanJson = intelligence.replace(/```json|```/g, '').trim();
    res.json({ status: 'success', data: JSON.parse(cleanJson) });
  } catch (err) {
    res.status(500).json({ error: 'AI Generation failed', details: err.message });
  }
});

const axios = require('axios');

// 2. ML Microservice Gateway: Resume Parser & Predictive ML
app.post('/api/parse-resume', async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });

  try {
    const mlResponse = await axios.post('http://127.0.0.1:5001/parse-resume', {
      text: resumeText
    });
    res.json(mlResponse.data);
  } catch (err) {
    console.error(`ML Parse Error: ${err.message}`);
    res.status(500).json({ error: 'Failed to communicate with ML Service' });
  }
});

app.post('/api/predict-success', async (req, res) => {
  const { features } = req.body;
  if (!features) return res.status(400).json({ error: 'Missing features array' });

  try {
    const mlResponse = await axios.post('http://127.0.0.1:5001/predict-success', {
      features: features
    });
    res.json(mlResponse.data);
  } catch (err) {
    console.error(`ML Prediction Error: ${err.message}`);
    res.status(500).json({ error: 'Failed to communicate with ML Service' });
  }
});

function makeProfileHash(studentData) {
  const key = JSON.stringify({
    education: studentData.education,
    preferences: studentData.preferences,
    skills: (studentData.skills || []).map(s => s.name || s).sort()
  });
  return crypto.createHash('sha256').update(key).digest('hex');
}

function findCachedRecord(hash) {
  try {
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
      if (data.profile_hash === hash) return data;
    }
  } catch (e) { }
  return null;
}

function logTrainingData(traceId, studentData, analysis, preVerified) {
  try {
    const logFile = path.join(RECORDS_DIR, 'training_log.json');
    let log = [];
    if (fs.existsSync(logFile)) {
      try { log = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch (e) { log = []; }
    }
    const entry = {
      id: traceId,
      timestamp: new Date().toISOString(),
      prompt: buildTrainingPrompt(studentData, preVerified),
      completion: typeof analysis === 'object' ? analysis.tab4CareerPath || JSON.stringify(analysis) : analysis,
      zone: preVerified?.primaryZone?.employer_zone || 'Unknown',
      degree: studentData.education?.degreeGroup || 'Unknown',
      role: studentData.preferences?.primary?.jobRole || 'Unknown',
      rating: null,       // filled later by /api/feedback
      is_synthetic: false
    };
    log.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
  } catch (e) {
    console.error('[TRAINING LOG ERROR - non-fatal]', e.message);
    // NEVER throw — this must not fail the main response
  }
}

function buildTrainingPrompt(studentData, preVerified) {
  return `Student degree: ${studentData.education?.degreeGroup || 'Unknown'} | Domain: ${studentData.education?.domain || 'Unknown'} | Target role: ${studentData.preferences?.primary?.jobRole || 'Unknown'} | Skills: ${(studentData.skills || []).map(s => s.name || s).join(', ')} | Zone: ${preVerified?.primaryZone?.employer_zone || 'Unknown'} | Missing: ${(preVerified?.primarySkillGap?.missing || []).join(', ')} | Generate career path:`;
}

// 3. Main Onboarding Engine
app.post('/api/onboarding', async (req, res) => {
  try {
    const studentData = req.body;
    console.log('Processing Onboarding Data...');

    const profileHash = makeProfileHash(studentData);
    const cached = findCachedRecord(profileHash);
    if (cached) {
      console.log('[CACHE HIT] Returning cached result for hash:', profileHash.slice(0, 8));
      return res.json({ success: true, cached: true, data: cached });
    }

    // --- IMMEDIATE Safety Fallback: Save user input draft ---
    const recordsDir = path.join(__dirname, 'records');
    if (!fs.existsSync(recordsDir)) fs.mkdirSync(recordsDir);
    const traceId = Date.now();
    const recordFilename = `analysis_${traceId}_${studentData.personalDetails?.name?.replace(/\s+/g, '_') || 'unknown'}.json`;
    const recordPath = path.join(recordsDir, recordFilename);
    const initialRecord = {
      timestamp: new Date().toISOString(),
      status: 'pending_analysis',
      input_user_data: studentData,
      output_generated_report: null
    };
    try {
      fs.writeFileSync(recordPath, JSON.stringify(initialRecord, null, 2));
      console.log(`📡 Trace [${traceId}]: User data captured locally.`);
    } catch (fsErr) {
      console.error('⚠️ Critical: Failed to save initial safety copy:', fsErr.message);
    }

    // Process using the intelligence engine
    let analysis;
    try {
      analysis = await processCareerIntelligence(studentData);

      // Enhance with real AI data if ANTHROPIC_API_KEY is available
      analysis = await enhanceWithAI(studentData, analysis);

      // Update record with analysis 
      const finalRecord = {
        ...initialRecord,
        status: 'completed',
        output_generated_report: analysis,
        profile_hash: profileHash,
        created_at: new Date().toISOString()
      };
      fs.writeFileSync(recordPath, JSON.stringify(finalRecord, null, 2));
      console.log(`✅ Trace [${traceId}]: Analysis appended to record.`);
    } catch (procErr) {
      console.error(`❌ Trace [${traceId}]: Analysis failed, record remains as-is.`, procErr.message);
      const errorRecord = { ...initialRecord, status: 'failed', error: procErr.message };
      fs.writeFileSync(recordPath, JSON.stringify(errorRecord, null, 2));
      throw procErr; // Rethrow to let the main catch handle it
    }

    // Save to Databases
    const studentName = studentData.personalDetails?.name || 'Unknown User';
    const studentEmail = studentData.personalDetails?.email || 'Unknown Email';
    const primaryRole = studentData.preferences?.primary?.role || 'Career Match';

    // Save to SQL Database (SQLite via Prisma)
    try {
      const preVerifiedData = analysis.preVerified || {};
      await prisma.careerAnalysis.create({
        data: {
          studentName,
          studentEmail,
          primaryRole,
          inputData: JSON.stringify(studentData),
          outputData: JSON.stringify(analysis),
          profileHash,
          collegeCode: req.body.collegeCode,
          zonePrimary: preVerifiedData?.primaryZone?.employer_zone || 'Unknown',
          zoneSecondary: preVerifiedData?.secondaryZone?.employer_zone || 'Unknown',
          zoneTertiary: preVerifiedData?.tertiaryZone?.employer_zone || 'Unknown',
          missingSkills: JSON.stringify(preVerifiedData?.primarySkillGap?.missing || []),
          matchedSkills: JSON.stringify(preVerifiedData?.primarySkillGap?.matched || []),
          skillCoveragePct: preVerifiedData?.primarySkillGap?.coveragePct || 0,
          pathText: (analysis.analysis || analysis).tab4CareerPath || '',
          futureScopeText: (analysis.analysis || analysis).tab5FutureScope || ''
        }
      });
      console.log('✅ Analysis saved to Prisma (SQLite)');
    } catch (sqlErr) {
      console.error('⚠️ Failed to save to SQL Database:', sqlErr.message);
    }

    // Save to MongoDB
    try {
      const preVerifiedData = analysis.preVerified || {};
      const analysisResult = analysis.analysis || analysis;

      const mongoRecord = new CareerAnalysisModel({
        student_name: studentName,
        student_email: studentEmail,
        primary_role: primaryRole,
        input_data: studentData,
        output_data: analysis,
        profile_hash: profileHash,
        college_code: req.body.collegeCode,
        zone_primary: preVerifiedData?.primaryZone?.employer_zone || 'Unknown',
        zone_secondary: preVerifiedData?.secondaryZone?.employer_zone || 'Unknown',
        zone_tertiary: preVerifiedData?.tertiaryZone?.employer_zone || 'Unknown',
        missing_skills: preVerifiedData?.primarySkillGap?.missing || [],
        matched_skills: preVerifiedData?.primarySkillGap?.matched || [],
        skill_coverage_pct: preVerifiedData?.primarySkillGap?.coveragePct || 0,
        path_text: analysisResult?.tab4CareerPath || '',
        future_scope_text: analysisResult?.tab5FutureScope || ''
      });
      await mongoRecord.save();
      console.log('✅ Analysis saved to MongoDB');
    } catch (mongoErr) {
      console.error('⚠️ Failed to save to MongoDB:', mongoErr.message);
    }

    logTrainingData(traceId, studentData, analysis.analysis || analysis, analysis.preVerified || null);

    res.json({
      status: 'success',
      recommendations: {
        primary: studentData.preferences?.primary?.role || studentData.preferences?.primary?.jobRole || 'Career Match',
        secondary: studentData.preferences?.secondary?.role || studentData.preferences?.secondary?.jobRole || 'Secondary Path',
        tertiary: studentData.preferences?.tertiary?.role || studentData.preferences?.tertiary?.jobRole || 'Alternative Option'
      },
      analysis
    });
  } catch (err) {
    console.error('Error in onboarding:', err);
    res.status(500).json({ error: 'Career analysis failed', details: err.message });
  }
});

// --- ADMIN HISTORY ENDPOINTS ---
app.get('/api/admin/history', authMiddleware, roleCheck(['admin']), async (req, res) => {
  try {
    const history = await prisma.careerAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(history);
  } catch (err) {
    console.error('Failed to fetch admin history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ─── CLAUDE ENGINE CHAT ENDPOINT ──────────────────────────────────────────────
app.post('/api/admin/claude-chat', authMiddleware, roleCheck(['admin']), async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  let anthropicKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  console.log(`🔑 Chat endpoint using key prefix: ${anthropicKey ? anthropicKey.substring(0, 10) : 'MISSING'}`);
  if (!anthropicKey) {
    return res.status(503).json({ error: 'Anthropic API key not configured in .env' });
  }

  try {
    // Load compiled roles for context
    let rolesContext = '';
    try {
      const compiledRoles = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/compiled_roles.json'), 'utf8'));
      const roleNames = Object.keys(compiledRoles);
      const roleCount = roleNames.length;
      const withNarratives = roleNames.filter(r => compiledRoles[r].narrative_para1 && compiledRoles[r].narrative_para3).length;
      rolesContext = `You have access to ${roleCount} audited career roles in the system database. ${withNarratives} of them have full narrative intelligence (Para 1, 2, 3). Sample roles: ${roleNames.slice(0, 10).join(', ')}...`;
    } catch (e) {
      rolesContext = 'Role database is available but could not be summarised right now.';
    }

    // Load recent analysis history count
    let historyContext = '';
    try {
      const historyCount = await prisma.careerAnalysis.count();
      historyContext = `There are ${historyCount} student career analyses in the PostgreSQL database.`;
    } catch (e) {
      historyContext = 'Database analytics not available.';
    }

    const systemPrompt = `You are the SMAART Career Intelligence Engine — an elite AI assistant built exclusively for the SMAART platform admin team. You help admins:
1. Generate career role intelligence data (narrative_para1, narrative_para2, narrative_para3) for any job role
2. Inspect and audit existing role data
3. Understand and explain the platform's career analysis logic
4. Generate structured JSON data for new roles to be added to the compiled_roles.json database

System Context:
- ${rolesContext}
- ${historyContext}
- The platform uses a 3-part narrative structure: Para1 = What This Role Does (day-in-the-life at Indian companies), Para2 = AI Evolution (AI exposure %, tools, what humans still do), Para3 = Who Should Consider (degree fit, salary progression, eligibility)
- All data is India-specific, focusing on Indian job market, salary in LPA, Indian companies, and Indian programme levels (UG/PG/MBA/CA)

When asked to generate role data, output a VALID JSON block for the role in this format:
{
  "role_name": "...",
  "job_family": "...",
  "domain_skills": [{"skill_name": "...", "importance": "High/Medium/Low"}],
  "technical_skills": [{"skill_name": "...", "importance": "High/Medium/Low"}],
  "ai_skills": [{"skill_name": "...", "importance": "High/Medium/Low"}],
  "foundational_skills": [{"skill_name": "...", "importance": "High/Medium/Low"}],
  "ai_exposure_pct": 0-100,
  "ai_exposure_level": "High/Medium/Low",
  "ai_exposure_detail": "...",
  "human_value_tasks": "...",
  "salary_range_low": 000000,
  "salary_range_high": 000000,
  "salary_progression": {"year_0_1": "X-Y lakh", "year_2_3": "...", "year_4_5": "...", "year_6_plus": "..."},
  "english_requirement": "Essential/Important/Helpful/Not Required",
  "remote_friendly": "Fully Remote/Commonly Remote/Hybrid Available/Office-Based",
  "emerging_role_flag": true/false,
  "programme_levels": "UG,PG,MBA",
  "narrative_para1": "Day-in-the-life paragraph...",
  "narrative_para2": "AI Evolution paragraph with % and tools...",
  "narrative_para3": "Who Should Consider paragraph with salary path..."
}

Always be professional, precise, and India-market-aware.`;

    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log(`🤖 Claude chat using model: claude-sonnet-4-6`);
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: systemPrompt,
        messages
      },
      {
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 30000
      }
    );

    const replyText = response.data.content[0].text;
    res.json({ reply: replyText, model: 'claude-sonnet-4-6' });

  } catch (err) {
    console.error('Claude chat error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Claude Engine failed', details: err.response?.data?.error?.message || err.message });
  }
});


app.get('/api/admin/drafts', authMiddleware, roleCheck(['admin']), (req, res) => {
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    try {
      const data = fs.readFileSync(draftsPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (e) {
      res.json([]);
    }
  } else {
    res.json([]);
  }
});

app.post('/api/admin/drafts/approve', authMiddleware, roleCheck(['admin']), (req, res) => {
  const { id } = req.body;
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    let drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
    drafts = drafts.filter(d => d.id !== id);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
    console.log(`✅ Admin approved draft ${id}. Moved to Knowledge Graph.`);
    res.json({ success: true, message: "Draft approved." });
  } else {
    res.status(404).json({ error: "No drafts found" });
  }
});

app.post('/api/admin/drafts/reject', authMiddleware, roleCheck(['admin']), (req, res) => {
  const { id } = req.body;
  const draftsPath = path.join(__dirname, '../ml-service/data_drafts.json');
  if (fs.existsSync(draftsPath)) {
    let drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf-8'));
    drafts = drafts.filter(d => d.id !== id);
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
    console.log(`❌ Admin rejected draft ${id}. Deleted.`);
    res.json({ success: true, message: "Draft rejected." });
  } else {
    res.status(404).json({ error: "No drafts found" });
  }
});

app.get('/api/dashboard/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Step 1: Search /records folder
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
      if (data.id === id || data.analysisId === id || file.includes(id)) {
        return res.json({ success: true, source: 'local', data });
      }
    }
    // Step 2: Fallback to SQL Database
    const result = await prisma.careerAnalysis.findUnique({ where: { id } });
    if (result) {
      return res.json({ success: true, source: 'sql', data: result });
    }
    return res.status(404).json({ success: false, message: 'Analysis not found' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { analysisId, rating, comment } = req.body;
    if (!analysisId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'analysisId and rating (1-5) required' });
    }

    // Save to feedback.json
    const feedbackFile = path.join(RECORDS_DIR, 'feedback.json');
    let feedbacks = [];
    if (fs.existsSync(feedbackFile)) {
      try { feedbacks = JSON.parse(fs.readFileSync(feedbackFile, 'utf8')); } catch (e) { }
    }
    feedbacks.push({ analysisId, rating, comment: comment || '', timestamp: new Date().toISOString() });
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));

    // Update training_log entry with rating
    try {
      const logFile = path.join(RECORDS_DIR, 'training_log.json');
      if (fs.existsSync(logFile)) {
        let log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        const idx = log.findIndex(e => e.id === analysisId);
        if (idx !== -1) { log[idx].rating = rating; fs.writeFileSync(logFile, JSON.stringify(log, null, 2)); }
      }
    } catch (e) { } // non-fatal

    res.json({ success: true, message: 'Feedback saved' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/po/:collegeCode/dashboard', authMiddleware, roleCheck(['college_admin']), async (req, res) => {
  try {
    const { collegeCode } = req.params;
    // Read all records and filter by collegeCode
    const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json') && f !== 'training_log.json' && f !== 'feedback.json');
    const students = [];
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(RECORDS_DIR, file), 'utf8'));
        if (collegeCode === 'all' || data.collegeCode === collegeCode || data.college_code === collegeCode) students.push(data);
      } catch (e) { }
    }
    // Build analytics
    const zones = { Green: 0, Amber: 0, Red: 0 };
    const directions = {};
    students.forEach(s => {
      const z = s.preVerified?.primaryZone?.employer_zone || 'Amber';
      if (zones[z] !== undefined) zones[z]++;
      const role = s.preferences?.primary?.role || s.preferences?.primary?.jobRole || 'Unknown';
      directions[role] = (directions[role] || 0) + 1;
    });
    res.json({
      success: true,
      collegeCode,
      totalStudents: students.length,
      zones,
      directions,
      students: students.map(s => ({
        id: s.id || s.analysisId,
        name: s.name || s.personalDetails?.name || 'Anonymous',
        zone: s.preVerified?.primaryZone?.employer_zone || 'Amber',
        lastActive: s.created_at || s.generated_at || new Date().toISOString()
      }))
    });
  } catch (e) {
    console.error('PO Dashboard Error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/roles', async (req, res) => {
  const cached = await getCached('all_roles');
  if (cached) return res.json(JSON.parse(cached));
  const result = roles; // existing roles data
  await setCached('all_roles', JSON.stringify(result), 3600);
  res.json(result);
});

app.get('/api/career-directions', async (req, res) => {
  const cached = await getCached('career_directions');
  if (cached) return res.json(JSON.parse(cached));
  // Group roles by job family from role_skills_db.json
  const { processCareerIntelligence, getRoleSkillsDB } = require('./engine');
  // For now return top-level families grouped from the data
  const families = {};
  Object.keys(roles).forEach(role => {
    const family = roles[role]?.family || 'General';
    if (!families[family]) families[family] = [];
    families[family].push(role);
  });
  await setCached('career_directions', JSON.stringify(families), 3600);
  res.json(families);
});

app.get('/', (req, res) => {
  res.json({ message: 'SMAART Engine Active', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`🚀 SMAART Backend running on http://localhost:${PORT}`);
});
