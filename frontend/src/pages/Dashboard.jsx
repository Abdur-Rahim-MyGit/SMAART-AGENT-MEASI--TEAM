import React, { useEffect, useState } from 'react';
import RoleDetailedView from './RoleDetailedView';
import MarketIntelligence from './MarketIntelligence';
import SkillsPanel from './SkillsPanel';
import AIImplementation from './AIImplementation';
import InterviewPrep from './InterviewPrep';
import ResumeTips from './ResumeTips';
import FutureScope from './FutureScope';
import ProjectSpace from './ProjectSpace';
import CareerDirectionCard from './CareerDirectionCard';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeRole, setActiveRole] = useState(1); 
    const [activePanel, setActivePanel] = useState('roledetail');
    const [lockedRole, setLockedRole]   = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);

    const handleLockPath = (roleName) => {
        setLockedRole(roleName);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3200);
    };

    useEffect(() => {
        const cached = localStorage.getItem('smaart_analysis');
        if (cached) {
            try {
                setData(JSON.parse(cached));
                setLoading(false);
            } catch (e) {
                console.error("Failed to parse analysis data:", e);
                navigate('/onboarding');
            }
        } else {
            navigate('/onboarding');
        }
    }, [navigate]);

    if (loading || !data) {
        return (
            <div id="screen-loading">
                <div className="loading-logo">SM<span>A</span>ART</div>
                <div className="loading-bar-wrap">
                    <div className="loading-bar-track">
                        <div className="loading-bar-fill" style={{ width: '90%' }}></div>
                    </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Generating Intelligence Panels...</p>
            </div>
        );
    }

    const { primary = {}, secondary = {}, tertiary = {}, combined_tab4 = {} } = data || {};
    const currentData = (activeRole === 1 ? primary : activeRole === 2 ? secondary : tertiary) || { tab1: { role_name: 'Unknown Role' } };
    
    // Prioritize role-specific roadmap data if available, fall back to global
    const roleSpecificTab4 = currentData?.tab4;
    const safeTab4 = roleSpecificTab4 || combined_tab4 || { 
        learning_roadmap: [], 
        projects: [], 
        certifications: [], 
        free_courses: [],
        skill_gap: { current_skills: [], missing_skills: [] } 
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'green-clr';
        if (score >= 50) return 'amber-clr';
        return 'red-clr';
    };

    const panels = [
        { id: 'roledetail', label: 'Role Detailed View', icon: '📋' },
        { id: 'market', label: 'Market Intel', icon: '📊' },
        { id: 'skills', label: 'Skill DNA', icon: '🧬' },
        { id: 'roadmap', label: 'Career Roadmap', icon: '🗺️' },
        { id: 'certs', label: 'Certifications', icon: '🏆' },
        { id: 'future', label: 'Future Scope', icon: '🚀' },
        { id: 'ai', label: 'AI Implementation', icon: '🤖' },
        { id: 'interview', label: 'Interview Prep', icon: '🎤' },
        { id: 'resume', label: 'Resume Tips', icon: '📄' },
        { id: 'projects', label: 'Project Space', icon: '🛸' }
    ];

    const matchScore = parseInt(currentData.match_explanation?.match(/\d+/) || 75);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '56px' }}>

            {/* ── Welcome Overlay ── */}
            {showWelcome && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.4s ease',
                }}>
                    {/* Animated ring */}
                    <div style={{
                        width: '88px', height: '88px', borderRadius: '50%',
                        border: '2px solid rgba(79,142,247,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.75rem', position: 'relative',
                        animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
                    }}>
                        <div style={{
                            position: 'absolute', inset: '-6px', borderRadius: '50%',
                            border: '2px solid var(--accent)', opacity: 0.4,
                        }} />
                        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>🔒</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.6rem', animation: 'fadeIn 0.4s ease 0.3s both' }}>Path Confirmed</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text1)', letterSpacing: '-0.02em', marginBottom: '0.5rem', textAlign: 'center', maxWidth: '480px', animation: 'fadeIn 0.4s ease 0.4s both' }}>
                        Welcome to Your Journey
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center', maxWidth: '360px', lineHeight: 1.65, animation: 'fadeIn 0.4s ease 0.5s both' }}>
                        You've locked in <strong style={{ color: 'var(--text2)' }}>{lockedRole}</strong> as your career path. Your SMAART roadmap is ready.
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.4s ease 0.7s both' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s ease infinite' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>Closing automatically…</span>
                    </div>
                </div>
            )}
            <header className="dash-header">
                <div className="dash-top">
                    <div>
                        <div className="dash-name">Career <span>Intelligence</span> Report</div>
                        <div className="dash-meta" style={{ display: 'flex', gap: '1rem' }}>
                            <span>CANDIDATE: {localStorage.getItem('smaart_student_name') || 'Student'}</span>
                            <span style={{ color: 'var(--muted)' }}>|</span>
                            <span>{localStorage.getItem('smaart_student_email')}</span>
                        </div>
                    </div>
                    <div className="dash-actions" style={{ display: 'flex', gap: '0.6rem' }}>
                        <button className="btn-ghost" onClick={() => window.print()}>Print Report</button>
                        <button className="btn-primary" onClick={() => navigate('/onboarding')}>New Analysis</button>
                    </div>
                </div>

                <div className="role-tabs-bar">
                    <button className={`rtab ${activeRole === 1 ? 'active' : ''}`} onClick={() => setActiveRole(1)}>
                        <span className="ztag green"></span> 🥇 {primary?.tab1?.role_name || 'Primary'}
                    </button>
                    <button className={`rtab ${activeRole === 2 ? 'active' : ''}`} onClick={() => setActiveRole(2)}>
                        <span className="ztag amber"></span> 🥈 {secondary?.tab1?.role_name || 'Secondary'}
                    </button>
                    <button className={`rtab ${activeRole === 3 ? 'active' : ''}`} onClick={() => setActiveRole(3)}>
                        <span className="ztag red"></span> 🥉 {tertiary?.tab1?.role_name || 'Tertiary'}
                    </button>
                </div>
            </header>

            <div className="dash-body">
                <aside className="sidebar">
                    <div className="sb-header">
                        <div className="sb-role-indicator">
                            <div className={`sb-role-dot ${activeRole === 1 ? 'green' : activeRole === 2 ? 'amber' : 'red'}`}></div>
                            <div className="sb-role-name">{currentData?.tab1?.role_name || 'Loading...'}</div>
                        </div>
                    </div>
                    
                    <div className="sidebar-nav" style={{ marginTop: '1rem' }}>
                        {panels.map(p => (
                            <button 
                                key={p.id} 
                                className={`sitem ${activePanel === p.id ? 'active' : ''}`}
                                onClick={() => setActivePanel(p.id)}
                            >
                                <span className="si-icon-wrap">{p.icon}</span>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <div className="ri-card" style={{ padding: '0.8rem', background: 'var(--navy3)' }}>
                            <div className="ri-label" style={{ fontSize: '0.55rem' }}>Account Status</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>PREMIUM ACCESS</div>
                        </div>
                    </div>
                </aside>

                <main className="dash-main">
                    {/* Panel 1: Overview */}
                    {activePanel === 'overview' && (
                        <div className="panel animate-fade-in">
                            <div className="overview-hero">
                                <div className={`oh-card ${activeRole === 1 ? 'zone-green-card' : activeRole === 2 ? 'zone-primary' : 'zone-red-card'}`}>
                                    <div className="oh-card-label">Overall Match</div>
                                    <div className={`oh-pct ${getScoreClass(matchScore)}`}>{matchScore}%</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>Alignment Probability</div>
                                </div>
                                <div className="oh-card" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                                    <div className="oh-card-label">Preparation Time</div>
                                    <div className="oh-pct" style={{ fontSize: '1.5rem', marginTop: '0.3rem' }}>{currentData?.preparation_time || 'N/A'}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>To reach Green Zone</div>
                                </div>
                                <div className="oh-card" style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}>
                                    <div className="oh-card-label">Market Demand</div>
                                    <div className="oh-pct" style={{ fontSize: '1.5rem', color: 'var(--accent)', marginTop: '0.3rem' }}>{currentData?.tab1?.job_demand || 'Stable'}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Hiring Velocity</div>
                                </div>
                            </div>
                            <div className="ml-score-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="ri-label" style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '1rem' }}>What This Role Does</div>
                                        <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{currentData?.tab1?.narrative_para1 || currentData?.tab1?.role_description || 'No description available.'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginLeft: '2rem' }}>
                                        <div className={`ml-score-num ${getScoreClass(matchScore)}`}>{matchScore}</div>
                                        <div className="ri-label" style={{ fontSize: '0.55rem' }}>ML FIT SCORE</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, width: '100%' }}>
                                    <div className="ri-label" style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '1rem' }}>AI Evolution</div>
                                    <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{currentData?.tab1?.narrative_para2 || currentData?.tab1?.ai_impact || 'AI assessment pending.'}</div>
                                </div>
                                <div style={{ flex: 1, width: '100%' }}>
                                    <div className="ri-label" style={{ color: 'var(--accent)', marginBottom: '0.4rem', fontSize: '1rem' }}>Who Should Consider</div>
                                    <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{currentData?.tab1?.narrative_para3 || `Preparing for this role...`}</div>
                                </div>
                            </div>
                            <div className="region-box">
                                <div className="ri-label">📍 Tier-1 India Market Signal</div>
                                <div className="rb-stats">
                                    <div className="rb-stat">
                                        <div className="oh-card-label">Typical Employers</div>
                                        <div className="rb-stat-num" style={{ fontSize: '0.8rem' }}>{currentData?.tab1?.typical_employers_india || 'MNCs & Startups'}</div>
                                    </div>
                                    <div className="rb-stat">
                                        <div className="oh-card-label">Common Entry</div>
                                        <div className="rb-stat-num" style={{ fontSize: '0.8rem' }}>{currentData?.tab1?.common_entry_paths || 'Campus Placement'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Panel: Role Detailed View */}
                    {activePanel === 'roledetail' && (
                        <div className="panel animate-fade-in">

                            {/* Header row with lock button */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <h2 style={{ margin: 0, marginBottom: '0.25rem' }}>📋 Role Detailed View</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.78rem', margin: 0 }}>Reviewing <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong> — confirm if this is your career path.</p>
                                </div>

                                {lockedRole === currentData.tab1.role_name ? (
                                    /* Locked state badge */
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.55rem 1rem',
                                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
                                        borderRadius: '10px',
                                        fontSize: '0.78rem', fontWeight: 700, color: 'var(--green)',
                                        flexShrink: 0,
                                    }}>
                                        <span>🔒</span> Path Locked In
                                    </div>
                                ) : (
                                    /* Lock button */
                                    <button
                                        onClick={() => handleLockPath(currentData.tab1.role_name)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.6rem 1.2rem',
                                            background: 'var(--navy2)', border: '1px solid var(--border)',
                                            borderRadius: '10px', cursor: 'pointer',
                                            fontSize: '0.8rem', fontWeight: 700, color: 'var(--text1)',
                                            transition: 'all 0.2s', flexShrink: 0,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text1)'; }}
                                    >
                                        <span>🔒</span> Lock In This Path
                                    </button>
                                )}
                            </div>

                            <RoleDetailedView roleName={currentData.tab1.role_name} />
                        </div>
                    )}

                    {/* Panel 2: Market Intel */}
                    {activePanel === 'market' && (
                        <div className="panel animate-fade-in">
                            <h2 style={{ marginBottom: '1.5rem' }}>📊 Market Intelligence</h2>
                            <MarketIntelligence
                                roleName={currentData.tab1.role_name}
                                fallback={currentData.tab1}
                            />
                        </div>
                    )}

                    {/* Panel 3: Skills */}
                    {activePanel === 'skills' && (
                        <div className="panel animate-fade-in">
                            <h2 style={{ marginBottom: '1.5rem' }}>⚙️ Skills Overview</h2>
                            <SkillsPanel roleName={currentData.tab1.role_name} />
                        </div>
                    )}

                    {/* Panel 5: Roadmap */}
                    {activePanel === 'roadmap' && (
                        <div className="panel animate-fade-in" style={{ padding: '1.75rem' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Compass size={24} color="var(--accent)" /> SMAART Career Intelligence
                                </h2>
                                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: '600px' }}>
                                    Your personalized acceleration path for <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong>, matched against your educational background and skill profile.
                                </p>
                            </div>
                            
                            {/* LEARNING ROADMAP & MILESTONE STEPS (Now at Top) */}
                            <div style={{ position: 'relative', paddingLeft: '2.5rem', marginBottom: '2.5rem' }}>
                                <div style={{ marginBottom: '1.25rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Learning Roadmap & Milestone Steps</div>
                                {/* Vertical line */}
                                <div style={{ position: 'absolute', left: '11px', top: '12px', bottom: '12px', width: '2px', background: 'linear-gradient(to bottom, var(--accent), transparent)', borderRadius: '2px' }} />
                                {safeTab4.learning_roadmap && safeTab4.learning_roadmap.length > 0 ? (
                                    safeTab4.learning_roadmap.map((step, i) => {
                                        const isLast = i === safeTab4.learning_roadmap.length - 1;
                                    return (
                                        <div key={i} style={{ position: 'relative', marginBottom: isLast ? 0 : '1.5rem' }}>
                                            {/* Step dot */}
                                            <div style={{
                                                position: 'absolute', left: '-2.5rem',
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                background: i === 0 ? 'var(--accent)' : 'var(--navy3)',
                                                border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border2)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: 900,
                                                color: i === 0 ? 'var(--navy)' : 'var(--muted)',
                                                flexShrink: 0,
                                            }}>{i + 1}</div>
                                            {/* Content card */}
                                            <div style={{
                                                background: 'var(--navy2)', border: '1px solid var(--border)',
                                                borderRadius: '12px', padding: '0.9rem 1.1rem',
                                                borderLeft: i === 0 ? '3px solid var(--accent)' : '1px solid var(--border)',
                                            }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: '0.3rem' }}>{step.step}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>{step.description}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--navy3)', borderRadius: '12px', color: 'var(--muted)', fontSize: '0.85rem' }}>
                                    Synthesizing your personalized roadmap... Please wait or refresh analysis.
                                </div>
                            )}
                            </div>

                            {/* DYNAMIC ROLE INTELLIGENCE & GAP ANALYSIS (Now at Last) */}
                            <CareerDirectionCard roleName={currentData.tab1.role_name} />
                        </div>
                    )}

                    {/* Panel 7: Future Scope */}
                    {activePanel === 'future' && (
                        <div className="panel animate-fade-in">
                            <h2 style={{ marginBottom: '0.4rem' }}>🚀 Future Trajectory &amp; Growth</h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                                Salary progression, role evolution, and who this path suits best — based on <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong>.
                            </p>
                            <FutureScope
                                roleName={currentData.tab1.role_name}
                                futureScope={currentData.tab5?.future_scope}
                                targetAudience={currentData.tab5?.target_audience}
                            />
                        </div>
                    )}

                    {/* Panel 8: AI Implementation */}
                    {activePanel === 'ai' && (
                        <div className="panel animate-fade-in">
                            <h2 style={{ marginBottom: '0.4rem' }}>🤖 AI Implementation in Role</h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>How AI is reshaping <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong> — exposure analysis, AI-native skills, and what remains irreplaceably human.</p>
                            <AIImplementation
                                roleName={currentData.tab1.role_name}
                                fallback={currentData.tab3}
                            />
                        </div>
                    )}

                    {/* Panel 11: Project Space */}
                    {activePanel === 'projects' && (
                        <div className="panel animate-fade-in">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <h2 style={{ margin: 0, marginBottom: '0.25rem' }}>🛸 Project Space</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.78rem', margin: 0 }}>
                                        High-impact blueprint builds that prove your skills for <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong>.
                                    </p>
                                </div>
                                {lockedRole && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.45rem 0.9rem',
                                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                                        borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)',
                                    }}>
                                        🔓 Unlocked
                                    </div>
                                )}
                            </div>

                            <ProjectSpace 
                                projects={safeTab4.projects || []}
                                locked={!lockedRole}
                                roleName={currentData.tab1.role_name}
                                onUnlockClick={() => setActivePanel('roledetail')}
                            />
                        </div>
                    )}

                    {/* Panel: Interview Prep */}
                    {activePanel === 'interview' && (
                        <div className="panel animate-fade-in">
                            <h2 style={{ marginBottom: '0.4rem' }}>🎤 Interview Prep</h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Resources and questions tailored for <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong> — aptitude, domain, technical &amp; HR rounds.</p>
                            <InterviewPrep roleName={currentData.tab1.role_name} />
                        </div>
                    )}

                    {/* Panel: Resume Tips */}
                    {activePanel === 'resume' && (
                        <div className="panel animate-fade-in">
                            <h2 style={{ marginBottom: '0.4rem' }}>📄 Resume Tips</h2>
                            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                                Build a strong, ATS-ready resume for <strong style={{ color: 'var(--text2)' }}>{currentData.tab1.role_name}</strong> — structure, keywords, and an AI generator.
                            </p>
                            <ResumeTips roleName={currentData.tab1.role_name} />
                        </div>
                    )}

                    {/* Placeholders for remaining panels */}
                    {!['overview', 'roledetail', 'market', 'skills', 'roadmap', 'future', 'ai', 'projects', 'interview', 'resume'].includes(activePanel) && (
                        <div className="panel animate-fade-in" style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
                            <h3>{panels.find(p => p.id === activePanel)?.label} Panel</h3>
                            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>This intelligence vector is currently being processed by the v7 analysis engine.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
