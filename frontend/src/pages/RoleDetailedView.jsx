import React, { useEffect, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────
   Narrative JSON files (served from /public)
   Each file is an array of:
   { role_name, narrative_para1, narrative_para2, narrative_para3 }
───────────────────────────────────────────── */
const NARRATIVE_FILES = [
    '/Tech_Career_Narratives.json',
    '/Finance_Career_Narratives.json',
];

/* ─────────────────────────────────────────────
   Role-profile JSON files (skills data)
   Served from /public – same structure used by
   the backend but now loaded client-side.
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

/* Fuzzy-match helper – case-insensitive substring match */
const fuzzyMatch = (haystack = '', needle = '') => {
    const h = haystack.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const n = needle.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (!n) return false;
    return h.includes(n) || n.includes(h);
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const RoleDetailedView = ({ roleName }) => {
    const [narratives, setNarratives] = useState([]);       // all narrative records
    const [roleProfiles, setRoleProfiles] = useState([]);   // all role-profile records
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ── Load all JSON files once on mount ── */
    useEffect(() => {
        let cancelled = false;

        const loadAll = async () => {
            try {
                // Load narrative files
                const narrativePromises = NARRATIVE_FILES.map(f =>
                    fetch(f).then(r => (r.ok ? r.json() : [])).catch(() => [])
                );
                // Load role-profile files
                const profilePromises = ROLE_PROFILE_FILES.map(f =>
                    fetch(f).then(r => (r.ok ? r.json() : [])).catch(() => [])
                );

                const [narrativeResults, profileResults] = await Promise.all([
                    Promise.all(narrativePromises),
                    Promise.all(profilePromises),
                ]);

                if (!cancelled) {
                    setNarratives(narrativeResults.flat());
                    setRoleProfiles(profileResults.flat());
                    setLoading(false);
                }
            } catch (e) {
                if (!cancelled) {
                    setError('Failed to load career data.');
                    setLoading(false);
                }
            }
        };

        loadAll();
        return () => { cancelled = true; };
    }, []);

    /* ── Find matching records for the role ── */
    const matchedNarrative = narratives.find(n => fuzzyMatch(n.role_name, roleName));
    const matchedProfile = roleProfiles.find(p => fuzzyMatch(p.role_name, roleName));

    /* ── Derive display values ── */
    const displayName = matchedNarrative?.role_name || matchedProfile?.role_name || roleName || 'Role';
    const para1 = matchedNarrative?.narrative_para1 || null;
    const para2 = matchedNarrative?.narrative_para2 || null;
    const para3 = matchedNarrative?.narrative_para3 || null;

    const aiExposurePct = matchedProfile?.ai_exposure_pct;
    const aiExposureLevel = matchedProfile?.ai_exposure_level;
    const aiExposureDetail = matchedProfile?.ai_exposure_detail;
    const humanValue = matchedProfile?.human_value_tasks;

    const techSkills = matchedProfile?.technical_skills || [];
    const domainSkills = matchedProfile?.domain_skills || [];
    const aiSkills = matchedProfile?.ai_skills || [];
    const foundationalSkills = matchedProfile?.foundational_skills || [];
    const salaryProgressions = matchedProfile?.salary_progression;

    /* ── Colour helpers ── */
    const aiPctColor = !aiExposurePct
        ? 'var(--accent)'
        : aiExposurePct >= 60
            ? 'var(--amber)'
            : aiExposurePct >= 40
                ? 'var(--green)'
                : '#64b5f6';

    /* ─────────── LOADING ─────────── */
    if (loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner} />
                <p style={{ color: 'var(--muted)', marginTop: '1rem', fontSize: '0.85rem' }}>
                    Loading role intelligence…
                </p>
            </div>
        );
    }

    /* ─────────── ERROR ─────────── */
    if (error) {
        return (
            <div style={styles.errorWrap}>
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <p>{error}</p>
            </div>
        );
    }

    /* ─────────── NO DATA ─────────── */
    const hasData = para1 || para2 || para3 || techSkills.length > 0;
    if (!roleName) {
        return (
            <div style={styles.emptyWrap}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ color: 'var(--text2)', marginBottom: '0.5rem' }}>No Role Selected</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    Complete onboarding with a job role to see the detailed breakdown here.
                </p>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div style={styles.emptyWrap}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <h3 style={{ color: 'var(--text2)', marginBottom: '0.5rem' }}>
                    No Detailed Data for "{roleName}"
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    The Agent Database doesn't yet have detailed narratives for this exact role.
                    We'll add more roles in future updates.
                </p>
            </div>
        );
    }

    /* ─────────── MAIN RENDER ─────────── */
    return (
        <div style={styles.container} className="animate-fade-in">
            {/* ───── Page header ───── */}
            <div style={styles.pageHeader}>
                <div style={styles.roleChip}>
                    <span style={styles.roleChipDot} />
                    <span style={styles.roleChipText}>ROLE INTELLIGENCE</span>
                </div>
                <h2 style={styles.roleName}>{displayName}</h2>

            </div>

            {/* ───── Three narrative boxes ───── */}
            <div style={styles.boxGrid}>

                {/* BOX 1 – What This Role Does */}
                <div style={styles.box}>
                    <div style={styles.boxHeader}>
                        <span style={styles.boxIcon}>🎯</span>
                        <div>
                            <div style={styles.boxTitle}>What This Role Does</div>
                        </div>
                    </div>
                    <div style={styles.boxDivider} />
                    {para1 ? (
                        <p style={styles.boxText}>{para1}</p>
                    ) : (
                        <p style={styles.missingText}>Narrative not available for this role in the Agent Database.</p>
                    )}

                    {/* Salary progression mini-grid */}
                    {/* {salaryProgressions && (
                        <div style={styles.salaryGrid}>
                            {Object.entries(salaryProgressions).map(([yr, val]) => (
                                <div key={yr} style={styles.salaryItem}>
                                    <div style={styles.salaryLabel}>{yr.replace(/_/g, ' ')}</div>
                                    <div style={styles.salaryValue}>{val}</div>
                                </div>
                            ))}
                        </div>
                    )} */}
                </div>

                {/* BOX 2 – AI Evolution */}
                <div style={{ ...styles.box, ...styles.boxAccent }}>
                    <div style={styles.boxHeader}>
                        <span style={styles.boxIcon}>🤖</span>
                        <div>
                            <div style={styles.boxTitle}>AI Evolution</div>
                        </div>

                    </div>
                    <div style={styles.boxDivider} />
                    {para2 ? (
                        <p style={styles.boxText}>{para2}</p>
                    ) : aiExposureDetail ? (
                        <p style={styles.boxText}>{aiExposureDetail}</p>
                    ) : (
                        <p style={styles.missingText}>AI evolution narrative not available for this role.</p>
                    )}

                    {/* AI tools tags */}
                    {/* {aiSkills.length > 0 && (
                        <div style={{ marginTop: '1.25rem' }}>
                            <div style={styles.tagGroupLabel}>🔑 Key AI Tools to Master</div>
                            <div style={styles.tagRow}>
                                {aiSkills.map((s, i) => (
                                    <span key={i} style={{ ...styles.tag, background: 'rgba(79,142,247,0.12)', color: 'var(--accent)', borderColor: 'rgba(79,142,247,0.3)' }}>
                                        {s.skill_name}
                                        <span style={styles.tagBadge}>{s.importance}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )} */}

                    {/* Human value tasks */}

                </div>

                {/* BOX 3 – Who Should Consider (skills from Agent Database) */}
                <div style={styles.box}>
                    <div style={styles.boxHeader}>
                        <span style={styles.boxIcon}>🎓</span>
                        <div>
                            <div style={styles.boxTitle}>Who Should Consider</div>
                        </div>
                    </div>
                    <div style={styles.boxDivider} />
                    {para3 ? (
                        <p style={styles.boxText}>{para3}</p>
                    ) : (
                        <p style={styles.missingText}>Eligibility narrative not available for this role.</p>
                    )}

                    {/* Skills breakdown from Agent Database */}


                    {/* Programme levels + remote info */}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Inline styles (matches SMAART v7 dark theme)
───────────────────────────────────────────── */
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '0.25rem',
    },
    loadingWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
    },
    errorWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        color: 'var(--red)',
        gap: '0.5rem',
    },
    emptyWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '280px',
        textAlign: 'center',
        padding: '3rem',
    },
    pageHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        marginBottom: '0.25rem',
    },
    roleChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
    },
    roleChipDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'var(--accent)',
    },
    roleChipText: {
        fontSize: '0.6rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: 'var(--accent)',
        textTransform: 'uppercase',
    },
    roleName: {
        fontSize: '1.6rem',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        color: 'var(--text1)',
        margin: 0,
    },
    aiPill: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.3rem 0.8rem',
        background: 'var(--navy3)',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        fontSize: '0.8rem',
        fontWeight: 700,
        width: 'fit-content',
    },
    boxGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.25rem',
    },
    box: {
        background: 'var(--navy2)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        transition: 'box-shadow 0.2s ease',
    },
    boxAccent: {
        background: 'linear-gradient(135deg, rgba(79,142,247,0.06) 0%, var(--navy2) 60%)',
        borderColor: 'rgba(79,142,247,0.2)',
    },
    boxHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem',
    },
    boxIcon: {
        fontSize: '1.4rem',
        lineHeight: 1,
    },
    boxLabel: {
        fontSize: '0.55rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: 'var(--muted)',
        textTransform: 'uppercase',
    },
    boxTitle: {
        fontSize: '1rem',
        fontWeight: 800,
        color: 'var(--accent)',
        marginTop: '0.1rem',
    },
    boxDivider: {
        height: '1px',
        background: 'var(--border)',
        marginBottom: '1rem',
    },
    boxText: {
        fontSize: '0.9rem',
        lineHeight: 1.75,
        color: 'var(--text2)',
        margin: 0,
    },
    missingText: {
        fontSize: '0.82rem',
        color: 'var(--muted)',
        fontStyle: 'italic',
        margin: 0,
    },
    pctBadge: {
        marginLeft: 'auto',
        padding: '0.25rem 0.6rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1.1rem',
        fontWeight: 900,
    },
    salaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.6rem',
        marginTop: '1.25rem',
    },
    salaryItem: {
        textAlign: 'center',
        padding: '0.6rem 0.4rem',
        background: 'rgba(79,142,247,0.05)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
    },
    salaryLabel: {
        fontSize: '0.55rem',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.3rem',
    },
    salaryValue: {
        fontSize: '0.78rem',
        fontWeight: 800,
        color: 'var(--accent)',
    },
    tagGroupLabel: {
        fontSize: '0.65rem',
        fontWeight: 800,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '0.5rem',
    },
    tagRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
    },
    tag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.65rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    tagBadge: {
        fontSize: '0.6rem',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '4px',
        padding: '0.1rem 0.3rem',
        color: 'var(--muted)',
    },
    humanValueBox: {
        marginTop: '1.25rem',
        padding: '0.9rem 1rem',
        background: 'rgba(16,185,129,0.07)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '10px',
    },
    humanValueLabel: {
        fontSize: '0.65rem',
        fontWeight: 800,
        color: 'var(--green)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    },
    metaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
    },
    metaTag: {
        padding: '0.3rem 0.65rem',
        background: 'var(--navy3)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text2)',
    },
};

export default RoleDetailedView;
