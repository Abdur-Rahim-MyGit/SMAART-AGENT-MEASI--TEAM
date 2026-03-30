import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import dropdownData from '../data/dropdownData.json';
import jobRolesData from '../data/jobRolesData.json';
import indianCities from '../data/indianCities.json';

// ─── Constants ────────────────────────────────────────────────────────────────
const SALARY_OPTIONS = [
  '0–3 LPA', '3–5 LPA', '5–8 LPA', '8–12 LPA', '12–18 LPA', '18–25 LPA', '25+ LPA'
];
const JOB_TYPE_OPTIONS = [
  'Full-Time', 'Part-Time', 'Internship (Full-Time)', 'Internship (Part-Time)',
  'Freelance / Gig Work', 'Remote (Fully Distributed)'
];
const EXP_TYPE_OPTIONS = [
  'Full-Time', 'Part-Time', 'Internship (Full-Time)', 'Internship (Part-Time)',
  'Freelance / Gig Work', 'Remote (Fully Distributed)', 'Volunteering'
];
const ORG_TYPE_OPTIONS = [
  'Startup (Early-stage / Growth-stage)', 'Scale-up / High-growth company',
  'Small or Medium Enterprise (SME)', 'Large Indian Corporate / Conglomerate',
  'Multinational Corporation (MNC)', 'Government / Public Sector Organization',
  'Non-Profit / NGO / Social Enterprise', 'Academic / Research Institution',
  'Consulting / Professional Services Firm', 'Family-owned Business',
  'Self-employed / Entrepreneurial Venture', 'Open to any organization type', 'Other / Custom'
];
const VERIFY_OPTIONS = ['URL', 'QR Code', 'Not Verified'];
const CERT_YEARS = Array.from({ length: 31 }, (_, i) => (2010 + i).toString());

// Build comprehensive sector list from jobRolesData
const ALL_SECTORS = [...Object.keys(dropdownData.jobs || {}), 'Other / Custom'];
// Build family options per sector
const getFamilies = (sector) => sector ? Object.keys(dropdownData.jobs[sector] || {}) : [];
const getRoles = (sector, family) => {
  if (!sector || !family) return [];
  return dropdownData.jobs[sector]?.[family] || [];
};
// All roles flattened for free-text search
const ALL_ROLES = jobRolesData.roles.map(r => r.role);

// Education cascading: Level → Domain → DegreeGroup → Specialisation
const EDU_DATA = dropdownData.education || {};
const getDomains = (level) => level ? Object.keys(EDU_DATA[level] || {}) : [];
const getDegreeGroups = (level, domain) => level && domain ? Object.keys(EDU_DATA[level]?.[domain] || {}) : [];
const getSpecialisations = (level, domain, degree) => level && domain && degree ? EDU_DATA[level]?.[domain]?.[degree] || [] : [];

const STEPS = ['Personal Details', 'Education', 'Primary Preference', 'Secondary Preference', 'Tertiary Preference', 'Work Experience', 'Skills & Certs', 'Review'];

// ─── MultiSelect ─────────────────────────────────────────────────────────────
function MultiSelect({ options, selected = [], onChange, max = 3, placeholder = 'Select...' }) {
  const [customVal, setCustomVal] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else if (selected.length < max) {
      if (opt === 'Other / Custom') {
        setShowInput(true);
      } else {
        onChange([...selected, opt]);
      }
    }
  };

  const handleAddCustom = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = customVal.trim();
      if (val && !selected.includes(val) && selected.length < max) {
        onChange([...selected, val]);
        setCustomVal('');
        setShowInput(false);
      }
    }
  };

  return (
    <div>
      <div className="tags" style={{ marginBottom: '0.6rem' }}>
        {selected.map(s => (
          <span key={s} className="tag">
            {s} <button type="button" onClick={() => toggle(s)}>×</button>
          </span>
        ))}
        {selected.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{placeholder}</span>}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          {options.map(opt => (
            <button
              key={opt} type="button"
              onClick={() => toggle(opt)}
              style={{
                padding: '0.25rem 0.75rem', fontSize: '0.72rem', borderRadius: '100px', cursor: 'pointer',
                fontFamily: 'var(--font)', border: '1px solid',
                background: selected.includes(opt) ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.03)',
                borderColor: selected.includes(opt) ? 'var(--accent)' : 'var(--border2)',
                color: selected.includes(opt) ? 'var(--text)' : 'var(--text2)',
                transition: 'all 0.15s',
                opacity: (!selected.includes(opt) && selected.length >= max) ? 0.4 : 1
              }}
            >
              {opt}
            </button>
          ))}
          {selected.length < max && !showInput && (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              style={{
                padding: '0.25rem 0.75rem', fontSize: '0.72rem', borderRadius: '100px', cursor: 'pointer',
                fontFamily: 'var(--font)', border: '1px dashed var(--accent)',
                background: 'rgba(79,142,247,0.05)',
                color: 'var(--accent)',
                transition: '0.2s'
              }}
            >
              + Other / Not in list
            </button>
          )}
        </div>

        {/* Custom Input (Only shows when + Other / Custom clicked) */}
        {showInput && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '0.8rem', background: 'rgba(79,142,247,0.04)', borderRadius: '10px', border: '1px solid var(--accent)', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Add Custom Specialisation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="text" 
                autoFocus
                placeholder="Type your own specialisation..." 
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                onKeyDown={handleAddCustom}
                style={{ fontSize: '0.75rem', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', flex: 1, padding: '0 0.8rem' }}
              />
              <button type="button" onClick={handleAddCustom} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>ADD</button>
              <button type="button" onClick={() => setShowInput(false)} style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </div>

      {max > 1 && <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.4rem' }}>Select up to {max}. If you don't see your option, use "Other / Custom".</p>}
    </div>
  );
}

// ─── RoleSearchInput ──────────────────────────────────────────────────────────
function RoleSearchInput({ value, onChange, sector, family }) {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef(null);

  const sectorRoles = getRoles(sector, family);
  const pool = sectorRoles.length > 0 ? sectorRoles : ALL_ROLES;
  const filtered = query.length > 0
    ? pool.filter(r => r.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : [];

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Type or search a job role..."
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        style={{ width: '100%' }}
      />
      {show && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--navy3)', border: '1px solid var(--border2)', borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)', maxHeight: '180px', overflowY: 'auto', marginTop: '4px' }}>
          {filtered.map(r => (
            <div
              key={r}
              onClick={() => { setQuery(r); onChange(r); setShow(false); }}
              style={{ padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text2)', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CitySearchInput ──────────────────────────────────────────────────────────
function CitySearchInput({ selected = [], onChange, max = 3 }) {
  const [query, setQuery] = useState('');
  const cities = Array.isArray(indianCities) ? indianCities : (indianCities.cities || []);
  const filtered = query.length > 0
    ? cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  const add = (city) => {
    if (!selected.includes(city) && selected.length < max) {
      onChange([...selected, city]);
    }
    setQuery('');
  };
  const remove = (city) => onChange(selected.filter(c => c !== city));

  return (
    <div>
      <div className="tags" style={{ marginBottom: '0.4rem' }}>
        {selected.map(c => (
          <span key={c} className="tag">{c} <button type="button" onClick={() => remove(c)}>×</button></span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <input type="text" placeholder="Search city..." value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={selected.length >= max}
          style={{ opacity: selected.length >= max ? 0.5 : 1 }}
        />
        {filtered.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--navy3)', border: '1px solid var(--border2)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxHeight: '160px', overflowY: 'auto', marginTop: '4px' }}>
            {filtered.map(c => (
              <div key={c} onClick={() => add(c)}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{c}</div>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Select up to {max} locations</p>
    </div>
  );
}

// ─── PrefBlock ────────────────────────────────────────────────────────────────
function PrefBlock({ label, colorClass, data, onChange }) {
  const sectors = ALL_SECTORS;
  const up = (field, val) => onChange({ ...data, [field]: val });

  // Priority branding
  const theme = {
    primary: { glow: 'rgba(79,142,247,0.15)', accent: 'var(--accent)', icon: '⭐', label: 'Primary Goal' },
    secondary: { glow: 'rgba(34,211,238,0.12)', accent: 'var(--accent2)', icon: '🥈', label: 'Alternative Path' },
    tertiary: { glow: 'rgba(167,139,250,0.12)', accent: '#a78bfa', icon: '🥉', label: 'Tertiary Option' }
  }[colorClass] || theme.primary;

  const sectionLabelStyle = { 
    fontSize: '0.68rem', 
    fontWeight: 900, 
    color: 'var(--muted)', 
    letterSpacing: '0.1em', 
    marginBottom: '1rem', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.6rem',
    textTransform: 'uppercase'
  };

  return (
    <div className={`pref-card-v2`} style={{ 
      background: 'rgba(255,255,255,0.01)', 
      border: '1px solid var(--border)', 
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: `0 10px 40px -10px ${theme.glow}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Accent Line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.accent }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        
        {/* SECTION A: TARGET ROLE */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
          <div style={sectionLabelStyle}><span style={{ color: theme.accent }}>01</span> 🎯 Career Targeting</div>
          <div className="fgrid">
            <div className="fg full" style={{ marginBottom: '1rem' }}>
              <label className="fl">Desired Job Role <span className="req">*</span></label>
              <RoleSearchInput value={data.role || ''} onChange={v => up('role', v)} />
            </div>
            <div className="fg full">
              <label className="fl">Broad Sector <span className="req">*</span></label>
              <MultiSelect
                options={sectors}
                selected={Array.isArray(data.sectors) ? data.sectors : (data.sector ? [data.sector] : [])}
                onChange={v => onChange({ ...data, sectors: v, sector: v[0] || '' })}
                max={3}
                placeholder="Select sectors..."
              />
            </div>
          </div>
        </div>

        {/* SECTION B: LOGISTICS */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.2rem' }}>
          <div style={sectionLabelStyle}><span style={{ color: 'var(--amber)' }}>02</span> 📍 Market Preferences</div>
          <div className="fgrid">
            <div className="fg">
              <label className="fl">Job Assignment Type</label>
              <select value={data.type || 'Full-Time'} onChange={e => up('type', e.target.value)}>
                {JOB_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Salary Expectation</label>
              <select value={data.salary || ''} onChange={e => up('salary', e.target.value)}>
                <option value="">Target Range...</option>
                {SALARY_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="fg full">
              <label className="fl">Geographic Preferences</label>
              <CitySearchInput
                selected={Array.isArray(data.locations) ? data.locations : (data.location ? [data.location] : [])}
                onChange={v => onChange({ ...data, locations: v, location: v[0] || '' })}
                max={3}
              />
            </div>
          </div>
        </div>

        {/* SECTION C: ORGANIZATION */}
        <div>
          <div style={sectionLabelStyle}><span style={{ color: '#a78bfa' }}>03</span> 🏢 Organization Fit</div>
          <div className="fg full">
            <label className="fl">Target Cultures (Multi)</label>
            <MultiSelect
              options={ORG_TYPE_OPTIONS}
              selected={Array.isArray(data.orgTypes) ? data.orgTypes : (data.orgType ? [data.orgType] : [])}
              onChange={v => onChange({ ...data, orgTypes: v })}
              max={3}
              placeholder="e.g. MNC, Startup..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── TagInput (Simple) ────────────────────────────────────────────────────────
function TagInput({ tags = [], onChange, placeholder = "Type & press Enter..." }) {
  const [input, setInput] = useState('');
  const add = () => {
    const s = input.trim();
    if (s && !tags.includes(s)) { onChange([...tags, s]); }
    setInput('');
  };
  return (
    <div>
      <div className="tags" style={{ marginBottom: '0.5rem' }}>
        {tags.map(t => (
          <span key={t} className="tag">{t} <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>×</button></span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="text" placeholder={placeholder} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          style={{ flex: 1, height: '38px', fontSize: '0.8rem' }}
        />
        <button type="button" className="btn-primary" style={{ padding: '0 1rem', height: '38px', borderRadius: '6px' }} onClick={add}>+</button>
      </div>
    </div>
  );
}

// ─── SkillSection ────────────────────────────────────────────────────────────
function SkillSection({ skills, onChange }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Verified');
  const [cert, setCert] = useState({ issuer: '', year: '', url: '' });

  const add = () => {
    if (name.trim()) {
      const newSkill = { 
        name: name.trim(), 
        status, 
        cert: status === 'Verified' ? { ...cert } : null 
      };
      onChange([...skills, newSkill]);
      setName('');
      setCert({ issuer: '', year: '', url: '' });
      // Keep selected status as the default for next entry (usually users add multiple verified or multiple self-learnt at once)
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Row 1: Skill Name & Basic Status */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label className="fl">Skill Name</label>
            <input type="text" placeholder="e.g. Python, Figma, React" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} />
          </div>
          <div style={{ width: '220px' }}>
            <label className="fl">Skill Status <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
              <button type="button" onClick={() => setStatus('Verified')} style={{ flex: 1, padding: '0.45rem', border: 'none', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', background: status === 'Verified' ? 'var(--accent)' : 'transparent', color: status === 'Verified' ? '#fff' : 'var(--muted)', transition: '0.2s' }}>VERIFIED</button>
              <button type="button" onClick={() => setStatus('Self-learnt')} style={{ flex: 1, padding: '0.45rem', border: 'none', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', background: status === 'Self-learnt' ? 'var(--amber)' : 'transparent', color: status === 'Self-learnt' ? '#000' : 'var(--muted)', transition: '0.2s' }}>SELF-LEARNT</button>
            </div>
          </div>
        </div>

        {/* Row 2 (Optional): Verification Details */}
        {status === 'Verified' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(79,142,247,0.03)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: '10px', padding: '1.2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🛡️ Verification Details (Certification)</div>
            <div className="fgrid">
              <div className="fg">
                <label className="fl">Issuing Organization</label>
                <input type="text" placeholder="e.g. Google India" value={cert.issuer} onChange={e => setCert({...cert, issuer: e.target.value})} />
              </div>
              <div className="fg">
                <label className="fl">Year</label>
                <select value={cert.year} onChange={e => setCert({...cert, year: e.target.value})}>
                  <option value="">Year...</option>
                  {CERT_YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="fg full">
                <label className="fl">Credential URL (Must start with http:// or https://)</label>
                <input type="url" placeholder="https://credentials.example.com/certificate/123" value={cert.url} onChange={e => setCert({...cert, url: e.target.value})} />
              </div>
            </div>
          </motion.div>
        )}

        <button type="button" onClick={add} className="btn-primary" style={{ height: '44px', width: '100%', fontSize: '0.85rem', fontWeight: 800 }}>
          {status === 'Verified' ? '+ Add Verified Skill & Certificate' : '+ Add Self-learnt Skill'}
        </button>
      </div>

      <div className="tags" style={{ marginTop: '1.5rem', minHeight: '40px' }}>
        {skills.map((s, idx) => (
          <span key={idx} className="tag" style={{ padding: '0.5rem 1rem', borderLeft: `5px solid ${s.status === 'Verified' ? 'var(--accent)' : 'var(--amber)'}`, background: 'rgba(255,255,255,0.04)' }}>
            <strong>{s.name}</strong> 
            <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: '0.5rem', color: s.status === 'Verified' ? 'var(--accent)' : 'var(--amber)' }}>● {s.status.toUpperCase()}</span>
            <button type="button" onClick={() => onChange(skills.filter((_, i) => i !== idx))} style={{ marginLeft: '0.8rem', opacity: 0.6 }}>×</button>
          </span>
        ))}
        {skills.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No skills added yet. Add your verified and self-learnt skills above.</p>}
      </div>

      <div style={{ marginTop: '1.2rem', padding: '0.9rem', background: 'rgba(79,142,247,0.05)', borderRadius: '10px', border: '1px solid rgba(79,142,247,0.1)', fontSize: '0.72rem', color: 'var(--text2)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <span style={{ fontSize: '1.4rem' }}>💡</span> 
        <span>Providing certification details for <strong>Verified</strong> skills significantly boosts your platform ranking and visibility to potential employers.</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const blankEdu = { level: '', domain: '', degreeGroup: '', specialisation: [], university: '', graduationYear: '', currentlyPursuing: false };
  const blankPref = { sectors: [], sector: '', family: '', role: '', type: 'Full-Time', salary: '', locations: [], location: '', orgTypes: [] };
  const blankExp = { orgName: '', designation: '', sector: '', type: 'Full-Time', startDate: '', endDate: '', currentlyWorking: false, isCustomSector: false };

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('smaart_onboarding_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // [MIGRATION] if education is still an object (from v6), wrap in array
        if (parsed.education && !Array.isArray(parsed.education)) {
          parsed.education = [parsed.education];
        }
        // [MIGRATION] ensure specialisation is an array
        parsed.education.forEach(edu => {
          if (edu.specialisation && !Array.isArray(edu.specialisation)) {
            edu.specialisation = [edu.specialisation];
          }
          if (!edu.specialisation) edu.specialisation = [];
        });
        // [MIGRATION] ensure skills are objects
        if (parsed.skills && parsed.skills.length > 0 && typeof parsed.skills[0] === 'string') {
          parsed.skills = parsed.skills.map(s => ({ name: s, status: 'Verified' }));
        }
        return parsed;
      } catch { }
    }
    return {
      personalDetails: { name: '', email: '', phone: '', location: '' },
      education: [{ ...blankEdu }],
      skills: [],
      experience: [{ ...blankExp }],
      preferences: {
        primary: { ...blankPref },
        secondary: { ...blankPref },
        tertiary: { ...blankPref }
      }
    };
  });

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('smaart_onboarding_draft', JSON.stringify(formData));
  }, [formData]);

  const updatePersonal = (field, val) => setFormData(f => ({ ...f, personalDetails: { ...f.personalDetails, [field]: val } }));
  const updateEdu = (i, field, val) => setFormData(f => {
    const edu = [...f.education]; edu[i] = { ...edu[i], [field]: val };
    // Reset lower cascading fields if higher fields change
    if (field === 'level') { edu[i].domain = ''; edu[i].degreeGroup = ''; edu[i].specialisation = []; }
    if (field === 'domain') { edu[i].degreeGroup = ''; edu[i].specialisation = []; }
    if (field === 'degreeGroup') { edu[i].specialisation = []; }
    return { ...f, education: edu };
  });
  const addEdu = () => setFormData(f => ({ ...f, education: [...f.education, { ...blankEdu }] }));
  const removeEdu = (i) => setFormData(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));
  const updatePref = (tier, data) => setFormData(f => ({ ...f, preferences: { ...f.preferences, [tier]: data } }));
  const updateExp = (i, field, val) => setFormData(f => {
    const exp = [...f.experience]; exp[i] = { ...exp[i], [field]: val };
    return { ...f, experience: exp };
  });
  const addExp = () => setFormData(f => ({ ...f, experience: [...f.experience, { ...blankExp }] }));
  const removeExp = (i) => setFormData(f => ({ ...f, experience: f.experience.filter((_, idx) => idx !== i) }));

  const isUG = formData.education.some(edu => edu.level === 'Undergraduate (UG)');
  const isPG = formData.education.some(edu => edu.level === 'Postgraduate (PG)');

  const handleNext = async () => {
    if (step === 1) await savePersonalDetails();
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        personalDetails: { ...formData.personalDetails, name: formData.personalDetails.name || 'Student' },
      };
      const res = await axios.post('http://localhost:5000/api/onboarding', payload);
        if (res.data?.analysis) {
          localStorage.setItem('smaart_analysis', JSON.stringify(res.data.analysis));
          localStorage.setItem('smaart_analysis_id', res.data.id || Date.now().toString());
          
          // SAVE RELEVANT PROFILE INFO FOR DYNAMIC PANELS
          if (formData.education && formData.education.length > 0) {
            const edu = formData.education[0];
            localStorage.setItem('smaart_user_degree', edu.degreeGroup || '');
            localStorage.setItem('smaart_user_specialisation', (Array.isArray(edu.specialisation) ? edu.specialisation[0] : edu.specialisation) || '');
          }
          
          if (formData.skills) {
            localStorage.setItem('smaart_user_skills', JSON.stringify(formData.skills));
          }
          
          localStorage.removeItem('smaart_onboarding_draft');
          navigate('/dashboard');
        }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save personal details to backend (Step 1)
  const savePersonalDetails = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/student/profile', {
        personalDetails: formData.personalDetails
      });
      if (res.data?.success || res.status === 200) {
        localStorage.setItem('smaart_student_name', formData.personalDetails.name);
        localStorage.setItem('smaart_student_email', formData.personalDetails.email);
      }
    } catch (err) {
      console.warn('Profile pre-save skipped:', err.message);
    }
  };

  const [submittingStep, setSubmittingStep] = useState(0);
  const loadingMessages = [
    "Initializing v7 Intelligence Engine...",
    "Correlating Educational Background...",
    "Analyzing Technical Skill Coverage...",
    "Simulating Industry Market Match...",
    "Synthesizing Strategic Roadmap...",
    "Generating Full Analysis Report..."
  ];

  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setSubmittingStep(s => (s < loadingMessages.length - 1 ? s + 1 : s));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  const resetProfile = () => {
    if (window.confirm('Are you sure you want to reset your profile? This will clear all entered data.')) {
      localStorage.removeItem('smaart_onboarding_draft');
      window.location.reload();
    }
  };

  if (isSubmitting) {
    return (
      <div id="screen-loading" style={{ background: 'var(--navy)', zIndex: 9999, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-logo" style={{ marginBottom: '3rem', fontSize: '2.5rem' }}>SM<span>A</span>ART</div>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <div className="loading-bar-wrap" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${(submittingStep + 1) * 16.6}%` }}
              transition={{ duration: 2, ease: "linear" }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', boxShadow: '0 0 15px var(--accent)' }}
            />
          </div>
          <motion.p 
            key={submittingStep}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600, marginTop: '1.5rem', textAlign: 'center', letterSpacing: '0.02em' }}
          >
            {loadingMessages[submittingStep]}
          </motion.p>
          <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: '0.5rem', textAlign: 'center' }}>V7 Processing Engine Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-onboard">
      {/* HEADER */}
      <div className="onboard-header">
        <div className="hero-badge"><span className="pulse-dot"></span> Career Intelligence Profile</div>
        <h1>Build Your <em>SMAART</em> Profile</h1>
        <p>Complete your profile to unlock a personalised career intelligence report.</p>
      </div>

      {/* STEP INDICATOR */}
      <div className="steps-wrap">
        <div className="steps-indicator">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-ind ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── STEP 1: PERSONAL DETAILS — CLEAN & SIMPLE ── */}
        {step === 1 && (
          <div className="form-card">
            <div className="step-title">👤 Personal Details <span className="step-tag">STEP 1 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Your basic information to personalise your career report.</p>
            
            <div className="fgrid">
              {/* Full Name */}
              <div className="fg">
                <label className="fl">Full Name <span className="req">*</span></label>
                <input type="text" required placeholder="e.g. Priya Sharma"
                  value={formData.personalDetails.name}
                  onChange={e => updatePersonal('name', e.target.value)}
                />
              </div>

              {/* Email Address */}
              <div className="fg">
                <label className="fl">Email Address <span className="req">*</span></label>
                <input type="email" required placeholder="your@email.com"
                  value={formData.personalDetails.email}
                  onChange={e => updatePersonal('email', e.target.value)}
                />
              </div>

              {/* Phone Number */}
              <div className="fg">
                <label className="fl">Phone Number</label>
                <input type="tel" placeholder="10-digit mobile number"
                  value={formData.personalDetails.phone}
                  onChange={e => updatePersonal('phone', e.target.value)}
                  maxLength={10}
                />
              </div>

              {/* Fill Dummy Data Button */}
              <div className="fg" style={{ alignSelf: 'end' }}>
                <button type="button" 
                  onClick={() => {
                    const first = ['Arjun', 'Ishan', 'Kavya', 'Meera', 'Rohan', 'Sanya', 'Vikram', 'Ananya'];
                    const last = ['Sharma', 'Verma', 'Gupta', 'Reddy', 'Nair', 'Patel', 'Das', 'Iyer'];
                    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];
                    const fn = first[Math.floor(Math.random() * first.length)];
                    const ln = last[Math.floor(Math.random() * last.length)];
                    const city = cities[Math.floor(Math.random() * cities.length)];
                    const rand = Math.floor(Math.random() * 9000) + 1000;
                    setFormData(prev => ({ 
                      ...prev, 
                      personalDetails: { 
                        name: `${fn} ${ln}`, 
                        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand}@example.com`, 
                        phone: `987${Math.floor(Math.random()*8999999)+1000000}`, 
                        location: `${city}, India` 
                      } 
                    }));
                  }}
                  style={{ width: '100%', padding: '0.6rem', background: 'rgba(79,142,247,0.1)', border: '1px dashed rgba(79,142,247,0.3)', color: 'var(--accent)', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  💡 Randomize Test Profile
                </button>
              </div>

              <div className="fg full">
                <label className="fl">Current City / Location</label>
                <input type="text" placeholder="e.g. Bangalore, Karnataka"
                  value={formData.personalDetails.location}
                  onChange={e => updatePersonal('location', e.target.value)}
                />
              </div>

              {/* College Code for PO Dashboard */}
              <div className="fg full" style={{ marginTop: '1rem' }}>
                <label className="fl" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🏛️ College / Institutional Code
                  <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Optional</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. SRM-PO-2024"
                  value={formData.collegeCode || ''}
                  onChange={e => setFormData(f => ({ ...f, collegeCode: e.target.value }))}
                  style={{ border: '1px dashed var(--accent)', background: 'rgba(79,142,247,0.03)' }}
                />
                <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                  Provided by your Placement Officer. This syncs your report with your college's official dashboard.
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>🔒</span> Your information is securely stored and used only for your report.
            </div>
          </div>
        )}


        {/* ── STEP 2: EDUCATION — MULTIPLE SUPPORT ── */}
        {step === 2 && (
          <div className="form-card">
            <div className="step-title">🎓 Education <span className="step-tag">STEP 2 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Your academic background — you can add up to 3 educational qualifications. At least one is required.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {formData.education.map((edu, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Education Background #{i + 1} {i === 0 && <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>(Mandatory)</span>}
                    </span>
                    {i > 0 && (
                      <button type="button" onClick={() => removeEdu(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.68rem', cursor: 'pointer' }}>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="fgrid">
                    {/* Level */}
                    <div className="fg">
                      <label className="fl">Degree Level <span className="req">*</span></label>
                      <select required={i === 0} value={edu.level} onChange={e => updateEdu(i, 'level', e.target.value)}>
                        <option value="">Select Level...</option>
                        {Object.keys(EDU_DATA).map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>

                    {/* Domain */}
                    <div className="fg">
                      <label className="fl">Domain <span className="req">*</span></label>
                      <select required={i === 0} value={edu.domain} onChange={e => updateEdu(i, 'domain', e.target.value)} disabled={!edu.level}>
                        <option value="">Select Domain...</option>
                        {getDomains(edu.level).map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>

                    {/* Degree Group */}
                    <div className="fg">
                      <label className="fl">Degree Group <span className="req">*</span></label>
                      <select required={i === 0} value={edu.degreeGroup} onChange={e => updateEdu(i, 'degreeGroup', e.target.value)} disabled={!edu.domain}>
                        <option value="">Select Degree...</option>
                        {getDegreeGroups(edu.level, edu.domain).map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>

                    {/* Specialisation (Multi) */}
                    <div className="fg">
                      <label className="fl">Specialisation(s) <span className="req">*</span></label>
                      <MultiSelect 
                        options={getSpecialisations(edu.level, edu.domain, edu.degreeGroup)}
                        selected={edu.specialisation || []}
                        onChange={v => updateEdu(i, 'specialisation', v)}
                        max={2}
                        placeholder="Select specialisation(s)..."
                      />
                    </div>

                    {/* University */}
                    <div className="fg">
                      <label className="fl">University / Institution</label>
                      <input type="text" placeholder="e.g. NIT Trichy" value={edu.university} onChange={e => updateEdu(i, 'university', e.target.value)} />
                    </div>

                    {/* Graduation Year */}
                    <div className="fg">
                      <label className="fl">Year of Graduation / Expected</label>
                      <input type="number" placeholder="e.g. 2024" min="2010" max="2040" value={edu.graduationYear} onChange={e => updateEdu(i, 'graduationYear', e.target.value)} />
                    </div>

                    {/* Currently Pursuing */}
                    <div className="fg full">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text2)' }}>
                        <input type="checkbox" checked={edu.currentlyPursuing} onChange={e => updateEdu(i, 'currentlyPursuing', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                        Currently Pursuing this degree
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {formData.education.length < 3 && (
                <button type="button" onClick={addEdu} style={{ background: 'rgba(79,142,247,0.06)', border: '1px dashed rgba(79,142,247,0.25)', color: 'var(--accent)', borderRadius: '10px', padding: '0.7rem 1.2rem', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font)', fontWeight: 600, width: '100%' }}>
                  + Add Another Education Background
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: PRIMARY PREFERENCE ── */}
        {step === 3 && (
          <div className="form-card">
            <div className="step-title">🎯 Primary Preference <span className="step-tag">STEP 3 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Your main career goal. The platform will perform deep analysis on this role first.</p>
            <PrefBlock label="Primary Preference" colorClass="primary" data={formData.preferences.primary} onChange={d => updatePref('primary', d)} />
          </div>
        )}

        {/* ── STEP 4: SECONDARY PREFERENCE ── */}
        {step === 4 && (
          <div className="form-card">
            <div className="step-title">🎯 Secondary Preference <span className="step-tag">STEP 4 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Your first alternative career path — helps us calculate zone overlap.</p>
            <PrefBlock label="Secondary Preference" colorClass="secondary" data={formData.preferences.secondary} onChange={d => updatePref('secondary', d)} />
          </div>
        )}

        {/* ── STEP 5: TERTIARY PREFERENCE ── */}
        {step === 5 && (
          <div className="form-card">
            <div className="step-title">🎯 Tertiary Preference <span className="step-tag">STEP 5 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Your backup or curiosity career path for a complete market view.</p>
            <PrefBlock label="Tertiary Preference" colorClass="tertiary" data={formData.preferences.tertiary} onChange={d => updatePref('tertiary', d)} />
          </div>
        )}

        {/* ── STEP 6: WORK EXPERIENCE ── */}
        {step === 6 && (
          <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="step-title" style={{ marginBottom: 0 }}>💼 Work Experience <span className="step-tag">STEP 6 / 8</span></div>
              {isUG && (
                <button type="button" className="btn-ghost" onClick={() => setStep(7)} style={{ color: 'var(--accent2)', fontWeight: 800, fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(34,211,238,0.06)', borderRadius: '8px' }}>
                  SKIP STEP →
                </button>
              )}
            </div>
            {isUG && (
              <div style={{ background: 'rgba(79,142,247,0.05)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: 'var(--text2)', border: '1px solid rgba(79,142,247,0.1)' }}>
                💡 Work experience is optional for UG students. If you have no experience, you can skip this.
              </div>
            )}
            {formData.experience.map((exp, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Experience #{i + 1}</span>
                  {formData.experience.length > 1 && <button type="button" onClick={() => removeExp(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font)' }}>Remove</button>}
                </div>
                <div className="fgrid">
                  <div className="fg">
                    <label className="fl">Organisation Name <span className="req">*</span></label>
                    <input type="text" placeholder="e.g. TechCorp Pvt. Ltd." value={exp.orgName} onChange={e => updateExp(i, 'orgName', e.target.value)} />
                  </div>
                  <div className="fg">
                    <label className="fl">Designation / Role <span className="req">*</span></label>
                    <input type="text" placeholder="e.g. Software Engineer Intern" value={exp.designation} onChange={e => updateExp(i, 'designation', e.target.value)} />
                  </div>
                  <div className="fg">
                    <label className="fl">Sector</label>
                    <select value={exp.isCustomSector ? 'Other' : exp.sector} 
                      onChange={e => {
                        if (e.target.value === 'Other') {
                          updateExp(i, 'isCustomSector', true);
                          updateExp(i, 'sector', '');
                        } else {
                          updateExp(i, 'isCustomSector', false);
                          updateExp(i, 'sector', e.target.value);
                        }
                      }}
                    >
                      <option value="">Select Sector...</option>
                      {ALL_SECTORS.filter(s => s !== 'Other / Custom').map(s => <option key={s}>{s}</option>)}
                      <option value="Other">Other / Custom</option>
                    </select>
                    {exp.isCustomSector && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '0.6rem' }}>
                        <input type="text" placeholder="Type custom sector..." value={exp.sector} onChange={e => updateExp(i, 'sector', e.target.value)} style={{ border: '1px solid var(--accent)' }} />
                        <button type="button" onClick={() => updateExp(i, 'isCustomSector', false)} style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '0.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>↺ Back to list</button>
                      </motion.div>
                    )}
                  </div>
                  <div className="fg">
                    <label className="fl">Experience Type</label>
                    <select value={exp.type} onChange={e => updateExp(i, 'type', e.target.value)}>
                      {EXP_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="fl">Start Date</label>
                    <input type="date" value={exp.startDate} onChange={e => updateExp(i, 'startDate', e.target.value)} />
                  </div>
                  <div className="fg">
                    <label className="fl">End Date</label>
                    <input type="date" value={exp.endDate} onChange={e => updateExp(i, 'endDate', e.target.value)} disabled={exp.currentlyWorking} style={{ opacity: exp.currentlyWorking ? 0.4 : 1 }} />
                  </div>
                  <div className="fg full">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text2)' }}>
                      <input type="checkbox" checked={exp.currentlyWorking} onChange={e => updateExp(i, 'currentlyWorking', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Currently Working Here
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addExp} style={{ background: 'rgba(79,142,247,0.08)', border: '1px dashed rgba(79,142,247,0.3)', color: 'var(--accent)', borderRadius: '10px', padding: '0.7rem 1.2rem', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font)', fontWeight: 600, width: '100%' }}>
              + Add Another Experience
            </button>
          </div>
        )}

        {/* ── STEP 7: SKILLS & VERIFICATION ── */}
        {step === 7 && (
          <div className="form-card">
            <div className="step-title">🛡️ Skills & Verification <span className="step-tag">STEP 7 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>List your technical skills. For verified skills, provide certification details to boost your profile strength.</p>

            <div style={{ marginBottom: '1rem' }}>
              <SkillSection skills={formData.skills} onChange={v => setFormData(f => ({ ...f, skills: v }))} />
            </div>
          </div>
        )}

        {/* ── STEP 8: REVIEW ── */}
        {step === 8 && (
          <div className="form-card">
            <div className="step-title">✅ Review & Submit <span className="step-tag">STEP 8 / 8</span></div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Review your profile before submitting. The SMAART engine will analyse your data and generate a personalised career intelligence report.</p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Education Summary */}
              <div className="ri-card" style={{ gridColumn: 'span 2' }}>
                <div className="ri-label">🎓 Education History</div>
                {formData.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: idx < formData.education.length - 1 ? '0.8rem' : 0, paddingBottom: idx < formData.education.length - 1 ? '0.8rem' : 0, borderBottom: idx < formData.education.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{edu.degreeGroup || 'Not set'} in {edu.specialisation?.join(', ') || 'General'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{edu.university} {edu.graduationYear ? `(${edu.graduationYear})` : ''}</p>
                  </div>
                ))}
              </div>

              {/* Preferences Summary */}
              <div className="ri-card">
                <div className="ri-label">🎯 Primary Job Role</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{formData.preferences.primary.role || 'Not set'}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{formData.preferences.primary.salary} · {formData.preferences.primary.locations?.[0]}</p>
              </div>

              <div className="ri-card">
                <div className="ri-label">🔧 Top Skills</div>
                <div className="tags" style={{ marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {formData.skills.length > 0 ? (
                    formData.skills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="tag" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderLeft: `3px solid ${s.status === 'Verified' ? 'var(--accent)' : 'var(--amber)'}` }}>{s.name}</span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>None added</span>
                  )}
                  {formData.skills.length > 4 && <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>+{formData.skills.length - 4}</span>}
                </div>
              </div>

              {/* Experience Summary */}
              <div className="ri-card" style={{ gridColumn: 'span 2' }}>
                <div className="ri-label">💼 Work Experience</div>
                {formData.experience.length > 0 ? (
                  formData.experience.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: idx < formData.experience.length - 1 ? '0.6rem' : 0 }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>{exp.designation} @ {exp.orgName}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{exp.type} · {exp.sector}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>No experience added (Student Profile)</p>
                )}
              </div>
            </div>

            {error && (
              <div style={{ color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.08),rgba(34,211,238,0.05))', border: '1px solid rgba(79,142,247,0.2)', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text2)' }}>
              🚀 Once submitted, SMAART's rule engine will compute your zone assignments, skill gaps, and personalised learning roadmap. This usually takes 2–5 seconds.
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1rem', borderRadius: '14px' }} disabled={isSubmitting}>
              {isSubmitting ? '⏳ Generating Report...' : '🎯 Generate My Career Intelligence Report →'}
            </button>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <div className="form-nav" style={{ maxWidth: '820px', margin: '1.5rem auto 0' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {step > 1 && (
              <button type="button" className="btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            <button type="button" onClick={resetProfile} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', padding: '0.38rem 0.9rem', fontSize: '0.78rem', fontFamily: 'var(--font)', fontWeight: 600, cursor: 'pointer' }}>
               ↺ Reset Form
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Step {step} of {STEPS.length}</span>
            {step < STEPS.length && (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Save & Continue →
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
