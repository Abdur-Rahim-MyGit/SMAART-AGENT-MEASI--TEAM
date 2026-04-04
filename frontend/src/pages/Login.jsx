import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Login, 2: OTP
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (step === 1) {
                // Step 1: Validate Credentials
                const res = await axios.post('http://localhost:5000/api/auth/login', formData);
                if (res.data.requiresOTP) {
                    setStep(2);
                }
            } else {
                // Step 2: Verify OTP
                const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                    email: formData.email,
                    otp: otp
                });
                
                localStorage.setItem('smaart_token', res.data.token);
                localStorage.setItem('smaart_user', JSON.stringify(res.data.user));
                
                const role = res.data.user?.role?.toLowerCase();
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'college_admin') {
                    navigate('/po');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (err) {
            console.error('Auth failed:', err);
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            {/* Background Orbs to match Home page */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(79, 142, 247, 0.15)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'float_premium 12s infinite alternate' }} />
            
            {/* ASIDE PANEL */}
            <div className="auth-panel-aside">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6 }}
                    className="auth-aside-content"
                >
                    <span className="auth-aside-tag">Institutional Gateway</span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        Career Intelligence <em className="home-txt-accent" style={{ background: 'linear-gradient(135deg, var(--accent2), var(--accent3))', WebkitBackgroundClip: 'text' }}>Analytics</em>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Access enterprise-grade career mapping, real-time competency analytics, and predictive placement models.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="auth-features"
                    >
                        <div className="auth-feature">
                            <div className="auth-feature-icon">📈</div>
                            <div className="auth-feature-text">
                                <h4>Market Intelligence</h4>
                                <p>Real-time vacancy and salary analysis against 225+ high-growth roles.</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🧬</div>
                            <div className="auth-feature-text">
                                <h4>Semantic Competency Matrix</h4>
                                <p>Deep semantic evaluation of your unique skill proficiencies.</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🛰️</div>
                            <div className="auth-feature-text">
                                <h4>Predictive Analytics</h4>
                                <p>Machine learning-driven success probability forecasting.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* FORM SECTION */}
            <div className="auth-form-section">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                    className="auth-card-premium home-glass-card"
                >
                    <div className="auth-title-group">
                        <div className="hero-badge" style={{ marginBottom: '1.5rem', background: 'rgba(79,142,247,0.1)' }}>
                            <span className="pulse-dot"></span>Authentication
                        </div>
                        <h3>Platform <em className="home-txt-accent" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text' }}>Access</em></h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Please authenticate to access your intelligence dashboard.</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.85rem', border: '1px solid rgba(255, 77, 77, 0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                        >
                            <span>⚠️</span> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                        {step === 1 ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
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
                                            placeholder="•••••••• (Leave blank if OTP-only)" 
                                            value={formData.password} 
                                            onChange={e => setFormData({...formData, password: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="fg">
                                <label className="fl">Verification Code (OTP)</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">🔑</span>
                                    <input 
                                        className="input-auth"
                                        style={{ borderColor: 'var(--accent)', background: 'rgba(79, 142, 247, 0.05)' }}
                                        type="text" 
                                        required 
                                        placeholder="6-digit code passed via terminal logs" 
                                        maxLength="6"
                                        value={otp} 
                                        onChange={e => setOtp(e.target.value)} 
                                        autoFocus
                                    />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                                    We've sent an authorization code to <strong style={{ color: 'var(--accent)' }}>{formData.email}</strong>
                                </p>
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: '0.5rem', transition: 'color 0.2s' }}
                                    onMouseOver={(e) => e.target.style.color = 'var(--text)'}
                                    onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
                                >
                                    ← Back to Authentication
                                </button>
                            </motion.div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', opacity: 0.8 }} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.8}>Account Recovery</a>
                        </div>

                        <button className="btn-premium" style={{ width: '100%', padding: '1.2rem', fontSize: '0.95rem', borderRadius: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                    Authenticating...
                                </>
                            ) : step === 1 ? 'Send One-Time Password ✨' : 'Secure Login →'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            New to SMAART? <Link to="/onboarding" style={{ color: 'var(--accent2)', fontWeight: 700, textDecoration: 'none' }}>Start Free Onboarding</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
