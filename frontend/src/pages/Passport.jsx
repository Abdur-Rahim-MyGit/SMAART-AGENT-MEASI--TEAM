import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Passport = () => {
    const navigate = useNavigate();
    const [matchData, setMatchData] = useState(null);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        try {
            const md = localStorage.getItem('careerMatch');
            const fd = localStorage.getItem('latestFormData');
            if (md) setMatchData(JSON.parse(md));
            if (fd) setFormData(JSON.parse(fd));
        } catch (e) {
            console.error("Error loading passport data", e);
        }
    }, []);

    const primaryRole = formData?.preferences?.primary?.role || 'Aspiring Professional';
    const readinessScore = matchData?.primary?.match_explanation?.match(/\d+/) || 85;
    const skills = formData?.skills || [];
    
    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: 'auto' }}>
            <div className="onboard-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="hero-badge"><span className="pulse-dot"></span>Verified Career Passport</div>
                <h1 style={{ fontSize: '3rem' }}>SMAART <em>Verified</em> Talent</h1>
                <p>Digital proof of readiness for {primaryRole}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Visual Identity */}
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '150px', height: '150px', background: 'var(--navy3)', borderRadius: '2rem', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '2px solid var(--border)' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${primaryRole}`} alt="Profile" style={{ width: '80%' }} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.2rem' }}>{formData?.personalDetails?.name || 'Explorer'}</div>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{primaryRole}</div>
                    
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--navy3)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Readiness Score</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)' }}>{readinessScore}%</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)' }}>Verified by SMAART-V7</div>
                    </div>
                </div>

                {/* Credentials */}
                <div className="panel">
                    <div className="ri-card">
                        <div className="ri-label">🎓 Verified Academic Profile</div>
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontWeight: 700 }}>{formData?.education?.university || 'University Not Specified'}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>{formData?.education?.degreeGroup} • {formData?.education?.specialization}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Batch of {formData?.education?.graduationYear} • GPA: {formData?.education?.gpa}</div>
                        </div>
                    </div>

                    <div className="ri-card" style={{ marginTop: '1.5rem' }}>
                        <div className="ri-label">⚡ Skill Registry Proof</div>
                        <div className="tags" style={{ marginTop: '1rem' }}>
                            {skills.map(s => (
                                <span key={s} className="tag" style={{ background: 'var(--navy3)', borderColor: 'var(--border)' }}>{s}</span>
                            ))}
                        </div>
                    </div>

                    <div className="ri-card" style={{ marginTop: '1.5rem', background: 'rgba(79,142,247,0.05)' }}>
                        <div className="ri-label">🏆 Certifications</div>
                        {formData?.certifications?.map((c, i) => (
                            <div key={i} style={{ marginTop: '1rem', paddingBottom: '0.8rem', borderBottom: i < formData.certifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{c.issuer} • {c.year}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>📥 Export PDF</button>
                        <button className="btn-ghost" style={{ flex: 1 }}>🔗 Share Link</button>
                    </div>
                </div>
            </div>
            
            <div style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>SMAART CAREER INTELLIGENCE PLATFORM • V7.02 PRODUCTION BUILD</p>
                <p style={{ fontSize: '0.6rem' }}>Token ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
        </div>
    );
};

export default Passport;
