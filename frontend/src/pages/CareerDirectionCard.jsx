import React, { useState, useEffect } from 'react';
import { Target, Compass, ChevronRight, AlertCircle, TrendingUp, UserRound, Zap, ListChecks } from 'lucide-react';

const CareerDirectionCard = ({ roleName }) => {
    const [data, setData] = useState({
        direction: null,
        narrative: null,
        profile: null,
        userSkills: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoleIntelligence = async () => {
            setLoading(true);
            try {
                // 1. GET USER METADATA FROM STORAGE
                const degree = localStorage.getItem('smaart_user_degree') || 'Bachelor of Technology';
                const spec = localStorage.getItem('smaart_user_specialisation') || 'Computer Science';
                const storedSkills = localStorage.getItem('smaart_user_skills');
                const userSkills = storedSkills ? JSON.parse(storedSkills) : [];

                // 2. DETERMINE JSON FILES PATHS
                let dirFile = 'career_directions_UG.json';
                if (degree.includes('Technology')) dirFile = 'career_directions_BTech.json';
                else if (degree.includes('Computer Applications')) dirFile = 'career_directions_BCA.json';
                else if (degree.includes('Science')) dirFile = 'career_directions_BSc.json';
                else if (degree.includes('Arts')) dirFile = 'career_directions_BA.json';
                else if (degree.includes('Law')) dirFile = 'career_directions_LLB.json';

                // Narratives & Profiles usually split by Tech / General
                // For this demo, we use Tech if role is tech-aligned
                const isTech = /Software|Developer|Engineer|Data|AI|ML|Cloud|Network|Cyber|Security|Tech|QA/i.test(roleName);
                const narrativeFile = isTech ? 'Tech_Career_Narratives.json' : 'Finance_Career_Narratives.json';
                const profileFile = isTech ? 'Tech_Role_Profiles_AUDITED_FINAL.json' : 'Finance_Role_Profiles_AUDITED_FINAL.json';

                // 3. FETCH ALL INTELLIGENCE
                const [dirMod, narMod, proMod] = await Promise.all([
                    import(`../data/career_directions/${dirFile}`),
                    import(`../data/job_narratives/${narrativeFile}`),
                    import(`../data/role_profiles/${profileFile}`)
                ]);

                // 4. FIND THE DATA
                // 4a. Direction
                let degreeKey = degree;
                if (dirFile === 'career_directions_BTech.json') {
                    if (spec.includes('Computer Science')) degreeKey = 'B.Tech CSE';
                    else if (spec.includes('IT')) degreeKey = 'B.Tech IT';
                    else if (spec.includes('Mechanical')) degreeKey = 'B.Tech Mechanical';
                    else degreeKey = 'B.Tech CSE';
                }
                
                const degreeInfo = dirMod.default[degreeKey];
                const foundDirection = degreeInfo?.directions?.find(dir => 
                    dir.roles.some(r => r.toLowerCase() === roleName.toLowerCase() || roleName.toLowerCase().includes(r.toLowerCase()))
                );

                // 4b. Narrative (Day in the Life)
                const foundNarrative = narMod.default.find(n => n.role_name.toLowerCase() === roleName.toLowerCase() || roleName.toLowerCase().includes(n.role_name.toLowerCase()));

                // 4c. Profile (Skill Gaps)
                const foundProfile = proMod.default.find(p => p.role_name.toLowerCase() === roleName.toLowerCase() || roleName.toLowerCase().includes(p.role_name.toLowerCase()));

                setData({
                    direction: foundDirection ? { ...foundDirection, degree: degreeKey } : null,
                    narrative: foundNarrative,
                    profile: foundProfile,
                    userSkills
                });

            } catch (err) {
                console.warn("Role intelligence data missing", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoleIntelligence();
    }, [roleName]);

    if (loading) return <div className="animate-pulse" style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }} />;
    if (!data.direction && !data.narrative) return null;

    // --- SKILL GAP LOGIC ---
    const missingHighSkills = data.profile?.technical_skills?.filter(ts => {
        const isHigh = ts.importance === 'High';
        if (!isHigh) return false;
        
        // Match against userSkills (which are objects { name, status, etc })
        const hasSkill = data.userSkills?.some(us => {
            const uName = (typeof us === 'string' ? us : (us.name || us.skill_name || '')).toLowerCase();
            const tsName = ts.skill_name.toLowerCase();
            return uName.includes(tsName) || tsName.includes(uName);
        });
        
        return !hasSkill;
    }) || [];

    const S = {
        container: {
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
        },
        card: {
            background: 'var(--navy2)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
        },
        header: {
            padding: '1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        badge: (type) => ({
            fontSize: '0.62rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            background: type === 'Primary' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            color: type === 'Primary' ? '#10b981' : '#f59e0b',
            border: `1px solid ${type === 'Primary' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
        }),
        content: {
            padding: '1.25rem',
        },
        title: {
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--text1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem'
        },
        tag: {
            fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'var(--text2)', border: '1px solid var(--border)'
        }
    };

    return (
        <div style={S.container}>
            {/* 1. CAREER DIRECTION & FIT */}
            {data.direction && (
                <div style={S.card}>
                    <div style={S.header}>
                        <div style={S.title}><Compass size={18} className="icon-accent" /> Audited Career Direction</div>
                        <span style={S.badge(data.direction.direction_type)}>{data.direction.direction_type} Fit</span>
                    </div>
                    <div style={S.content}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.4rem' }}>PATHWAY VIA: <span style={{ color: 'var(--accent)' }}>{data.direction.degree}</span></div>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem', color: 'var(--text1)' }}>{data.direction.direction_name}</h4>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>{data.direction.direction_description}</p>
                        
                        <div style={S.grid}>
                            <div style={{ background: 'rgba(79,142,247,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(79,142,247,0.1)' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}><TrendingUp size={12} /> STRATEGIC FIT</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text2)', margin: 0, lineHeight: 1.5 }}>{data.direction.why_primary || data.direction.realistic_note}</p>
                            </div>
                            <div style={{ background: 'rgba(245,158,11,0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}><Target size={12} /> TRANSITION EFFORT</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text2)', margin: 0, lineHeight: 1.5 }}>{data.direction.estimated_additional_effort || "Minimal (Direct pathway)"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. DYNAMIC SKILL GAP ANALYSIS (The "Dynamic" part) */}
            {data.profile && (
                <div style={S.card}>
                    <div style={S.header}>
                        <div style={S.title}><ListChecks size={18} color="var(--amber)" /> Dynamic Gap Analysis</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Matches against your <span style={{ color: 'var(--text2)' }}>{data.userSkills.length}</span> skills</div>
                    </div>
                    <div style={S.content}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>Comparing your profile with SMAART’s audited requirements for <strong style={{ color: 'var(--accent)' }}>{roleName}</strong>.</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                            {missingHighSkills.length > 0 ? (
                                <>
                                    <div style={{ width: '100%', fontSize: '0.62rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>PRIORITY SKILL GAPS:</div>
                                    {missingHighSkills.map((s, i) => (
                                        <div key={i} style={{ ...S.tag, background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Zap size={10} fill="#f59e0b" /> {s.skill_name}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div style={{ width: '100%', background: 'rgba(16,185,129,0.05)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#10b981', fontSize: '0.8rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    ✨ <strong>Strong Match!</strong> You possess all core technical skills required for this role.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. A DAY IN THE LIFE */}
            {data.narrative && (
                <div style={S.card}>
                    <div style={S.header}>
                        <div style={S.title}><UserRound size={18} color="var(--accent)" /> Contextual Day in the Life</div>
                    </div>
                    <div style={S.content}>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.7, margin: 0, fontStyle: 'italic', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid var(--accent)' }}>
                            {data.narrative.narrative_para1}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerDirectionCard;
