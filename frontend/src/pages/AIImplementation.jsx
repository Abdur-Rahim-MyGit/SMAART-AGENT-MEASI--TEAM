import React, { useEffect, useState } from 'react';

/* ── Data sources ── */
const PROFILE_FILES = [
    '/Tech_Role_Profiles_AUDITED_FINAL.json',
    '/Finance_Role_Profiles_AUDITED_FINAL.json',
    '/Biz_Mgmt_Role_Profiles_AUDITED_FINAL.json',
    '/Engineering_Manufacturing_Construction_Role_Profiles_AUDITED_FINAL.json',
    '/HR_PeopleManagement_Role_Profiles_AUDITED_FINAL.json',
    '/Healthcare_LifeSciences_Role_Profiles_AUDITED_FINAL.json',
    '/Sales_Mktg_Role_Profiles_AUDITED_FINAL.json',
];
const NARRATIVE_FILES = [
    '/Tech_Career_Narratives.json',
    '/Finance_Career_Narratives.json',
];

const fuzzyMatch = (hay = '', needle = '') => {
    const h = hay.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const n = needle.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    return n && (h.includes(n) || n.includes(h));
};

/* Importance dot colours for AI skills */
const IMP = { Critical: '#ef4444', High: '#f59e0b', Medium: '#6b7fa8', Low: '#374151' };

/* Single AI skill row */
const AISkillRow = ({ skill, index }) => {
    const imp   = skill.importance || 'Medium';
    const dot   = IMP[imp] || IMP.Medium;
    const isOdd = index % 2 === 1;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            background: isOdd ? 'rgba(255,255,255,0.015)' : 'transparent',
            borderRadius: '7px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0, boxShadow: `0 0 4px ${dot}66` }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text2)' }}>{skill.skill_name}</span>
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: dot }}>{imp}</span>
        </div>
    );
};

/* ── Main Component ── */
const AIImplementation = ({ roleName, fallback }) => {
    const [profiles,   setProfiles]   = useState([]);
    const [narratives, setNarratives] = useState([]);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            ...PROFILE_FILES.map(f   => fetch(f).then(r => r.ok ? r.json() : []).catch(() => [])),
            ...NARRATIVE_FILES.map(f => fetch(f).then(r => r.ok ? r.json() : []).catch(() => [])),
        ]).then(res => {
            if (!cancelled) {
                setProfiles(res.slice(0, PROFILE_FILES.length).flat());
                setNarratives(res.slice(PROFILE_FILES.length).flat());
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    const p = profiles.find(r   => fuzzyMatch(r.role_name, roleName));
    const n = narratives.find(r => fuzzyMatch(r.role_name, roleName));

    /* Derived values — prefer Agent DB, fall back to engine data */
    const level         = p?.ai_exposure_level   || fallback?.ai_exposure?.level || '—';
    const detail        = p?.ai_exposure_detail  || fallback?.ai_impact          || null;
    const humanTasks    = p?.human_value_tasks   || fallback?.ai_exposure?.human_value || null;
    const aiEvoPara     = n?.narrative_para2     || null;
    const aiSkills      = p?.ai_skills           || [];
    const aiTools       = fallback?.ai_tools     || [];

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Loading AI intelligence…</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">


            {/* ── AI Evolution Narrative (from Agent DB narrative_para2) ── */}
            {aiEvoPara && (
                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
                    <div style={S.sectionHeader}>
                        <span>🧬</span>
                        <div>
                            <div style={S.sectionSub}>Agent Database · AI Narrative</div>
                            <div style={S.sectionTitle}>AI Evolution Story</div>
                        </div>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
                    <p style={S.body}>{aiEvoPara}</p>
                </div>
            )}

            {/* ── AI Exposure Detail ── */}
            {detail && !aiEvoPara && (
                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
                    <div style={S.sectionHeader}><span>🤖</span><div><div style={S.sectionSub}>Agent Database</div><div style={S.sectionTitle}>AI Exposure Detail</div></div></div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
                    <p style={S.body}>{detail}</p>
                </div>
            )}

            {/* ── Two-col: AI Skills + Human Tasks ── */}
            <div style={{ display: 'grid', gridTemplateColumns: aiSkills.length > 0 && humanTasks ? '1fr 1fr' : '1fr', gap: '1rem' }}>

                {/* AI Skills from Agent DB */}
                {aiSkills.length > 0 && (
                    <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={S.sectionHeader}>
                                <span>🛠️</span>
                                <div>
                                    <div style={S.sectionSub}>Agent Database</div>
                                    <div style={S.sectionTitle}>AI Tools to Master</div>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.15rem 0.55rem' }}>
                                {aiSkills.length}
                            </span>
                        </div>
                        <div style={{ padding: '0.4rem 0.25rem' }}>
                            {aiSkills.map((s, i) => <AISkillRow key={i} skill={s} index={i} />)}
                        </div>
                    </div>
                )}

                {/* Human Value Tasks */}
                {humanTasks && (
                    <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
                        <div style={S.sectionHeader}><span>💡</span><div><div style={S.sectionSub}>Human Value</div><div style={{ ...S.sectionTitle, color: 'var(--green)' }}>Irreplaceable Tasks</div></div></div>
                        <div style={{ height: '1px', background: 'rgba(16,185,129,0.15)', margin: '0.75rem 0' }} />
                        <p style={{ ...S.body, lineHeight: 1.75 }}>{humanTasks}</p>
                    </div>
                )}
            </div>

            {/* ── Engine-recommended AI Tools (fallback tab3 data) ── */}
            {aiTools.length > 0 && (
                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem 1.3rem' }}>
                    <div style={S.sectionHeader}><span>⚡</span><div><div style={S.sectionSub}>SMAART Engine Recommendation</div><div style={S.sectionTitle}>Recommended AI Tools</div></div></div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {aiTools.map((t, i) => (
                            <span key={i} style={{
                                padding: '0.35rem 0.8rem',
                                background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)',
                                borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)',
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            }}>
                                🤖 {t.name || t.tool_name}
                                {(t.priority || t.usage_level) && <span style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>· {t.priority || t.usage_level}</span>}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Shared styles ── */
const S = {
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '0.55rem' },
    sectionSub:    { fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.15rem' },
    sectionTitle:  { fontSize: '0.88rem', fontWeight: 800, color: 'var(--text1)' },
    body:          { fontSize: '0.86rem', lineHeight: 1.75, color: 'var(--text2)', margin: 0 },
};

export default AIImplementation;
