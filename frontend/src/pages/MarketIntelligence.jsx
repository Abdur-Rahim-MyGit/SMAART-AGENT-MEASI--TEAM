import React, { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────
   All role-profile JSON files (served from /public)
   Structure per record:
   { role_name, job_family, ai_exposure_pct, ai_exposure_level,
     ai_exposure_detail, human_value_tasks,
     salary_range_low, salary_range_high,
     salary_progression: { year_0_1, year_2_3, year_4_5, year_6_plus },
     english_requirement, remote_friendly, emerging_role_flag,
     programme_levels, ai_skills, technical_skills, ... }
───────────────────────────────────────────── */
const ROLE_PROFILE_FILES = [
    '/Tech_Role_Profiles_AUDITED_FINAL.json',
    '/Finance_Role_Profiles_AUDITED_FINAL.json',
    '/Biz_Mgmt_Role_Profiles_AUDITED_FINAL.json',
    '/Engineering_Manufacturing_Construction_Role_Profiles_AUDITED_FINAL.json',
    '/HR_PeopleManagement_Role_Profiles_AUDITED_FINAL.json',
    '/Healthcare_LifeSciences_Role_Profiles_AUDITED_FINAL.json',
    '/Sales_Mktg_Role_Profiles_AUDITED_FINAL.json',
];

const fuzzyMatch = (hay = '', needle = '') => {
    const h = hay.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const n = needle.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (!n) return false;
    return h.includes(n) || n.includes(h);
};

/* Colour for AI exposure % */
const aiColor = pct => pct >= 60 ? '#f59e0b' : pct >= 40 ? '#10b981' : '#4f8ef7';

/* Salary progression labels */
const YR_LABELS = {
    year_0_1: 'Year 0–1',
    year_2_3: 'Year 2–3',
    year_4_5: 'Year 4–5',
    year_6_plus: 'Year 6+',
};

/* ─── Main Component ─── */
const MarketIntelligence = ({ roleName, fallback }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all(
            ROLE_PROFILE_FILES.map(f =>
                fetch(f).then(r => r.ok ? r.json() : []).catch(() => [])
            )
        ).then(results => {
            if (!cancelled) {
                setProfiles(results.flat());
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    const p = profiles.find(r => fuzzyMatch(r.role_name, roleName));

    /* ── helpers ── */
    const fmt = n => n ? `₹${(n / 100000).toFixed(1)}L` : '—';

    if (loading) return (
        <div style={S.loadWrap}>
            <div style={S.spinner} />
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '1rem' }}>Loading market data…</p>
        </div>
    );

    return (
        <div style={S.root} className="animate-fade-in">

            {/* ── ROW 1 : Hero stat pills (3 cols) ── */}
            <div style={S.heroRow}>

                {/* AI Exposure */}
                <div style={{ ...S.heroPill, borderColor: p ? aiColor(p.ai_exposure_pct) + '44' : 'var(--border)', background: p ? aiColor(p.ai_exposure_pct) + '12' : 'var(--navy3)' }}>
                    <div style={{ ...S.heroIcon, color: p ? aiColor(p.ai_exposure_pct) : 'var(--muted)' }}>🤖</div>
                    <div>
                        <div style={S.heroLabel}>AI Exposure</div>
                        <div style={{ ...S.heroValue, color: p ? aiColor(p.ai_exposure_pct) : 'var(--text2)' }}>
                            {p ? `${p.ai_exposure_pct}%` : fallback?.ai_exposure_pct ? `${fallback.ai_exposure_pct}%` : '—'}
                        </div>
                        <div style={S.heroSub}>{p?.ai_exposure_level || '—'}</div>
                    </div>
                </div>

                {/* Salary Range */}
                <div style={S.heroPill}>
                    <div style={{ ...S.heroIcon, color: 'var(--accent)' }}>💰</div>
                    <div>
                        <div style={S.heroLabel}>Salary Range (Entry)</div>
                        <div style={{ ...S.heroValue, color: 'var(--accent)' }}>
                            {p ? `${fmt(p.salary_range_low)} – ${fmt(p.salary_range_high)}` : fallback?.salary_range || '—'}
                        </div>
                        <div style={S.heroSub}>Annual CTC (INR)</div>
                    </div>
                </div>

                {/* Remote */}
                <div style={S.heroPill}>
                    <div style={{ ...S.heroIcon, color: 'var(--green)' }}>🏠</div>
                    <div>
                        <div style={S.heroLabel}>Remote Friendly</div>
                        <div style={{ ...S.heroValue, color: 'var(--green)', fontSize: '1rem' }}>
                            {p?.remote_friendly || fallback?.remote_friendly || '—'}
                        </div>
                        <div style={S.heroSub}>Work mode</div>
                    </div>
                </div>
            </div>

            {/* ── ROW 2 : AI Exposure Detail + Human Tasks (right after hero) ── */}
            {(p?.ai_exposure_detail || fallback?.ai_impact) && (
                <div style={{ ...S.card, borderColor: p?.ai_exposure_pct >= 60 ? 'rgba(245,158,11,0.25)' : 'rgba(79,142,247,0.2)', background: 'linear-gradient(135deg,rgba(79,142,247,0.06),rgba(245,158,11,0.04))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={S.cardLabel}>🤖 AI Exposure Detail</div>
                        {p?.ai_exposure_pct && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Automation Level</div>
                                <AiBar pct={p.ai_exposure_pct} />
                                <div style={{ fontWeight: 900, fontSize: '1rem', color: aiColor(p.ai_exposure_pct) }}>{p.ai_exposure_pct}%</div>
                            </div>
                        )}
                    </div>
                    <p style={S.bodyText}>{p?.ai_exposure_detail || fallback?.ai_impact}</p>
                </div>
            )}

            {p?.human_value_tasks && (
                <div style={{ ...S.card, background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                    <div style={S.cardLabel}>💡 Human Value Tasks</div>
                    <p style={{ ...S.bodyText, marginTop: '0.6rem' }}>{p.human_value_tasks}</p>
                </div>
            )}

            {/* ── ROW 3 : Job Family + Meta tags ── */}
            {(p?.job_family || p?.english_requirement || p?.programme_levels || fallback?.job_demand) && (
                <div style={S.card}>
                    <div style={S.cardLabel}>📋 Role Profile &amp; Requirements</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                        Key role metadata — the job family this role belongs to, language requirements for the workplace,
                        minimum education level typically expected, and current hiring demand signal.
                    </p>
                    <div style={S.metaBar}>
                        {p?.job_family && (
                            <span style={{ ...S.metaChip, background: 'rgba(79,142,247,0.1)', borderColor: 'rgba(79,142,247,0.25)', color: 'var(--accent)' }}>
                                🗂️ <strong>Job Family:</strong>&nbsp;{p.job_family}
                            </span>
                        )}
                        {p?.english_requirement && (
                            <span style={{ ...S.metaChip, background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.25)', color: '#a78bfa' }}>
                                🗣️ <strong>English:</strong>&nbsp;{p.english_requirement}
                            </span>
                        )}
                        {p?.programme_levels && (
                            <span style={{ ...S.metaChip, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--amber)' }}>
                                🎓 <strong>Min. Education:</strong>&nbsp;{p.programme_levels}
                            </span>
                        )}
                        {fallback?.job_demand && (
                            <span style={{ ...S.metaChip, background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: 'var(--green)' }}>
                                📈 <strong>Market Demand:</strong>&nbsp;{fallback.job_demand}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* ── ROW 3 : Salary Progression Timeline ── */}
            <div style={S.card}>
                <div style={S.cardLabel}>📊 Salary Progression Path</div>
                <div style={S.salaryGrid}>
                    {p?.salary_progression
                        ? Object.entries(p.salary_progression).map(([key, val], i) => (
                            <SalaryStage key={key} label={YR_LABELS[key] || key.replace(/_/g, ' ')} value={val} index={i} total={4} />
                        ))
                        : fallback?.salary_progression
                            ? Object.entries(fallback.salary_progression).map(([key, val], i) => (
                                <SalaryStage key={key} label={key.replace(/_/g, ' ')} value={val} index={i} total={4} />
                            ))
                            : <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>No progression data available.</p>
                    }
                </div>
            </div>

            {/* ── ROW 4 : Employers + Entry Paths (from AI engine data) ── */}
        </div>
    );
};

/* ── Salary Stage Card ── */
const STAGE_COLORS = ['#4f8ef7', '#22d3ee', '#10b981', '#a78bfa'];
const SalaryStage = ({ label, value, index }) => (
    <div style={S.stageWrap}>
        <div style={{ ...S.stageDot, background: STAGE_COLORS[index] }} />
        {index < 3 && <div style={S.stageLine} />}
        <div style={S.stageCard}>
            <div style={{ ...S.stageLabel, color: STAGE_COLORS[index] }}>{label}</div>
            <div style={S.stageValue}>{value}</div>
        </div>
    </div>
);

/* ── AI Progress Bar ── */
const AiBar = ({ pct }) => (
    <div style={{ width: '80px', height: '6px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${aiColor(pct)},${aiColor(pct)}aa)`, borderRadius: '100px', transition: 'width 1s ease' }} />
    </div>
);

/* ─────────── Styles ─────────── */
const S = {
    root: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    loadWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' },
    spinner: { width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' },

    /* Hero row */
    heroRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' },
    heroPill: { background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
    heroIcon: { fontSize: '1.3rem', lineHeight: 1, marginTop: '0.1rem', flexShrink: 0 },
    heroLabel: { fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.2rem' },
    heroValue: { fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 },
    heroSub: { fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.2rem' },

    /* Meta bar */
    metaBar: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    metaChip: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: 'var(--navy3)', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text2)' },

    /* Cards */
    card: { background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem 1.3rem' },
    cardLabel: { fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    bodyText: { fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text2)', margin: 0 },

    /* Salary progression */
    salaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.75rem' },
    stageWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
    stageDot: { width: '10px', height: '10px', borderRadius: '50%', marginBottom: '0.5rem', flexShrink: 0, boxShadow: '0 0 0 3px rgba(255,255,255,0.06)' },
    stageLine: { position: 'absolute', top: '5px', left: 'calc(50% + 5px)', width: 'calc(100% - 5px)', height: '2px', background: 'var(--border)' },
    stageCard: { width: '100%', padding: '0.75rem 0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center' },
    stageLabel: { fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.35rem' },
    stageValue: { fontSize: '0.82rem', fontWeight: 800, color: 'var(--text1)' },
};

export default MarketIntelligence;
