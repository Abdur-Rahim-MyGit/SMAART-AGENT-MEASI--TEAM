import React, { useEffect, useState } from 'react';

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
    return n && (h.includes(n) || n.includes(h));
};

const IMP_DOT = {
    Critical:    '#ef4444',
    High:        '#f59e0b',
    Medium:      '#6b7fa8',
    Low:         '#374151',
};

const SECTIONS = [
    { key: 'technical_skills',    icon: '⚙️', label: 'Technical Skills'   },
    { key: 'domain_skills',       icon: '🧩', label: 'Domain Skills'       },
    { key: 'ai_skills',           icon: '🤖', label: 'AI Skills'           },
    { key: 'foundational_skills', icon: '🌱', label: 'Foundational Skills' },
];

/* ── Single skill row ── */
const SkillRow = ({ skill, index }) => {
    const imp   = skill.importance || 'Medium';
    const dot   = IMP_DOT[imp] || IMP_DOT.Medium;
    const isOdd = index % 2 === 1;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.6rem 0.9rem',
            background: isOdd ? 'rgba(255,255,255,0.015)' : 'transparent',
            borderRadius: '8px',
            transition: 'background 0.15s',
        }}>
            {/* Skill name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: dot, flexShrink: 0,
                    boxShadow: `0 0 4px ${dot}66`,
                }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text2)' }}>
                    {skill.skill_name}
                </span>
            </div>

            {/* Importance badge */}
            <span style={{
                fontSize: '0.62rem', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                color: dot, opacity: 0.85,
            }}>
                {imp}
            </span>
        </div>
    );
};

/* ── Section block ── */
const SkillSection = ({ section, skills }) => {
    if (!skills || skills.length === 0) return null;
    return (
        <div style={{
            background: 'var(--navy2)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            overflow: 'hidden',
        }}>
            {/* Section header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.85rem 1.1rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.02)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>{section.icon}</span>
                    <span style={{
                        fontSize: '0.82rem', fontWeight: 800,
                        color: 'var(--text1)', letterSpacing: '-0.01em',
                    }}>
                        {section.label}
                    </span>
                </div>
                <span style={{
                    fontSize: '0.68rem', fontWeight: 700,
                    color: 'var(--muted)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)',
                    borderRadius: '100px', padding: '0.15rem 0.55rem',
                }}>
                    {skills.length}
                </span>
            </div>

            {/* Skill rows */}
            <div style={{ padding: '0.4rem 0.2rem' }}>
                {skills.map((s, i) => <SkillRow key={i} skill={s} index={i} />)}
            </div>
        </div>
    );
};

/* ── Main Component ── */
const SkillsPanel = ({ roleName }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all(
            ROLE_PROFILE_FILES.map(f =>
                fetch(f).then(r => r.ok ? r.json() : []).catch(() => [])
            )
        ).then(results => {
            if (!cancelled) { setProfiles(results.flat()); setLoading(false); }
        });
        return () => { cancelled = true; };
    }, []);

    const p = profiles.find(r => fuzzyMatch(r.role_name, roleName));

    /* Loading */
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '180px', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Loading skills…</p>
        </div>
    );

    /* No data */
    if (!p) return (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🔍</div>
            <p style={{ fontSize: '0.82rem' }}>
                No skill data found for <strong style={{ color: 'var(--text2)' }}>"{roleName}"</strong> in the Agent Database.
            </p>
        </div>
    );

    const totalSkills = SECTIONS.reduce((acc, s) => acc + (p[s.key]?.length || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }} className="animate-fade-in">

            {/* ── Meta header bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1.1rem',
                background: 'var(--navy2)', border: '1px solid var(--border)',
                borderRadius: '12px',
            }}>
                <div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Skill Profile
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text1)' }}>
                        {p.role_name}
                    </div>
                </div>

                {/* Summary counts */}
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {[
                        { label: 'Total', val: totalSkills },
                        ...SECTIONS.map(s => ({ label: s.label.split(' ')[0], val: p[s.key]?.length || 0 })),
                    ].map(({ label, val }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text1)', lineHeight: 1 }}>{val}</div>
                            <div style={{ fontSize: '0.58rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Skill sections (2-col grid) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {SECTIONS.map(section => (
                    <SkillSection key={section.key} section={section} skills={p[section.key]} />
                ))}
            </div>

            {/* ── Legend (bottom) ── */}
            <div style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                padding: '0.5rem 0.9rem',
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid var(--border)', borderRadius: '10px',
                flexWrap: 'wrap',
            }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Importance:
                </span>
                {Object.entries(IMP_DOT).map(([label, color]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SkillsPanel;
