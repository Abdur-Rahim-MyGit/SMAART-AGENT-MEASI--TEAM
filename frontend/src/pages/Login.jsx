import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('smaart_token', res.data.token);
            localStorage.setItem('smaart_user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* ASIDE PANEL */}
            <div className="auth-panel-aside">
                <div className="auth-aside-content">
                    <span className="auth-aside-tag">Professional Gateway</span>
                    <h2>Strategic <em>Precision</em> for Your Career</h2>
                    <p>Access your personalized career roadmap, real-time market verified skills, and AI-powered success forecasting.</p>
                    
                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">📈</div>
                            <div className="auth-feature-text">
                                <h4>Market Verified</h4>
                                <p>Analysis against 225+ high-growth roles in India.</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🧬</div>
                            <div className="auth-feature-text">
                                <h4>Skill DNA</h4>
                                <p>Deep semantic matching of your unique capabilities.</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🛰️</div>
                            <div className="auth-feature-text">
                                <h4>Predictive Success</h4>
                                <p>ML-driven probability for your target career paths.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FORM SECTION */}
            <div className="auth-form-section">
                <div className="auth-card-premium">
                    <div className="auth-title-group">
                        <div className="hero-badge" style={{ marginBottom: '1.5rem' }}>
                            <span className="pulse-dot"></span>Secure Session
                        </div>
                        <h3>Welcome <em>Back</em></h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Enter your credentials to access your dashboard.</p>
                    </div>

                    {error && (
                        <div style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.85rem', border: '1px solid rgba(255, 77, 77, 0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                        <div className="fg">
                            <label className="fl">Email Address</label>
                            <div className="input-with-icon">
                                <span className="input-icon">📧</span>
                                <input 
                                    className="input-auth"
                                    type="email" 
                                    required 
                                    placeholder="your@email.com" 
                                    value={formData.email} 
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="fg">
                            <label className="fl">Password</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input 
                                    className="input-auth"
                                    type="password" 
                                    required 
                                    placeholder="••••••••" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
                        </div>

                        <button className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '0.9rem', borderRadius: '14px' }} disabled={isSubmitting}>
                            {isSubmitting ? 'Verifying Identity...' : 'Sign In to SMAART →'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            New to SMAART? <Link to="/onboarding" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Start Free Onboarding</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
