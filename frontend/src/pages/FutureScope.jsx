import React, { useEffect, useState } from 'react';

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

/* ── Salary stage config ── */
const SALARY_STAGES = [
    { key: 'year_0_1',   label: 'Year 0–1',   sub: 'Entry Level',     icon: '🌱' },
    { key: 'year_2_3',   label: 'Year 2–3',   sub: 'Junior–Mid',      icon: '📈' },
    { key: 'year_4_5',   label: 'Year 4–5',   sub: 'Mid–Senior',      icon: '🚀' },
    { key: 'year_6_plus',label: 'Year 6+',    sub: 'Senior & Beyond', icon: '🏆' },
];

/* ── Box style matching RoleDetailedView ── */
const box = {
    background: 'var(--navy2)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
};
const boxAccent = {
    background: 'linear-gradient(135deg, rgba(79,142,247,0.06) 0%, var(--navy2) 60%)',
    borderColor: 'rgba(79,142,247,0.2)',
};
const divider = { height: '1px', background: 'var(--border)', margin: '0.75rem 0 1rem' };

/* ── Box header matching RoleDetailedView ── */
const BoxHeader = ({ icon, label, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{icon}</span>
        <div>
            {label && <div style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>{label}</div>}
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>{title}</div>
        </div>
    </div>
);

const FutureScope = ({ roleName, futureScope, targetAudience }) => {
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

    const salary     = p?.salary_progression || null;
    const salLow     = p?.salary_range_low   || null;
    const salHigh    = p?.salary_range_high  || null;
    const remote     = p?.remote_friendly    || null;
    const progLevels = p?.programme_levels   || null;
    const emerging   = p?.emerging_role_flag;
    const para3      = n?.narrative_para3    || null;

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Loading growth data…</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">

            {/* ── Salary Progression Timeline ── */}
            {salary && (
                <div style={box}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }}>
                        {SALARY_STAGES.map((stage, i) => {
                            const val = salary[stage.key];
                            if (!val) return null;
                            return (
                                <div key={stage.key} style={{
                                    textAlign: 'center', padding: '1rem 0.5rem',
                                    background: i === 0 ? 'rgba(79,142,247,0.06)' : 'rgba(255,255,255,0.015)',
                                    border: `1px solid ${i === 0 ? 'rgba(79,142,247,0.2)' : 'var(--border)'}`,
                                    borderRadius: '12px', position: 'relative',
                                }}>
                                    {/* Connector arrow (except last) */}
                                    {i < 3 && (
                                        <div style={{
                                            position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)',
                                            fontSize: '0.7rem', color: 'var(--border)', zIndex: 1,
                                        }}>→</div>
                                    )}
                                    <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{stage.icon}</div>
                                    <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>{stage.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{stage.sub}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: i === 0 ? 'var(--accent)' : 'var(--text1)' }}>₹{val}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Two col: Role Evolution + Who Should Consider ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                {/* Role Evolution */}
                <div style={{ ...box, ...boxAccent }}>
                    <BoxHeader icon="🚀" label="SMAART Engine" title="Role Evolution" />
                    <div style={divider} />
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text2)', margin: 0 }}>
                        {futureScope || 'Role evolution data not available for this role.'}
                    </p>
                </div>

                {/* Who Should Consider (para3 from Agent DB) */}
                <div style={box}>
                    <BoxHeader icon="🎓" label={para3 ? 'Agent Database' : 'SMAART Engine'} title="Who Should Consider" />
                    <div style={divider} />
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text2)', margin: 0 }}>
                        {para3 || targetAudience || 'Target audience data not available.'}
                    </p>
                </div>
            </div>

            {/* ── Quick insight chips ── */}
            {(remote || progLevels || emerging !== undefined) && (
                <div style={{ ...box, padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {remote && (
                            <Chip icon="🌐" label={remote} />
                        )}
                        {progLevels && progLevels.split(',').map(l => (
                            <Chip key={l} icon="🎓" label={`Eligible: ${l.trim()}`} />
                        ))}
                        {emerging === true && <Chip icon="⭐" label="Emerging Role" accent />}
                        {emerging === false && <Chip icon="✅" label="Established Role" />}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Chip ── */
const Chip = ({ icon, label, accent }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.3rem 0.75rem',
        background: accent ? 'rgba(79,142,247,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent ? 'rgba(79,142,247,0.25)' : 'var(--border)'}`,
        borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
        color: accent ? 'var(--accent)' : 'var(--text2)',
    }}>
        {icon} {label}
    </span>
);

export default FutureScope;
