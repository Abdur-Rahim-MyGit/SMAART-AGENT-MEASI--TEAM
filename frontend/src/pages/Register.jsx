import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            if (res.data.userId) {
                // After registration, usually log them in or redirect to login
                alert('Registration successful! Please login to continue.');
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.error || 'Registration failed. Email might already exist.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            {/* ASIDE PANEL */}
            <div className="auth-panel-aside">
                <div className="auth-aside-content">
                    <span className="auth-aside-tag">Professional Access</span>
                    <h2>Future <em>Ready</em> Growth Engine</h2>
                    <p>Create your secure account to save your intelligence profiles, track skill gaps, and download your Career Passport.</p>
                    
                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🛡️</div>
                            <div className="auth-feature-text">
                                <h4>Data Sovereignty</h4>
                                <p>All your career decisions securely stored and encrypted.</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🎫</div>
                            <div className="auth-feature-text">
                                <h4>Career Passport</h4>
                                <p>Unlock your personalized profile once verified.</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">🔍</div>
                            <div className="auth-feature-text">
                                <h4>AI Deep Scan</h4>
                                <p>Continuously scanned matching for 225+ job roles.</p>
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
                            <span className="pulse-dot"></span>Secure Identity
                        </div>
                        <h3>Join <em>SMAART</em></h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Create your professional career intelligence account.</p>
                    </div>

                    {error && (
                        <div style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.85rem', border: '1px solid rgba(255, 77, 77, 0.2)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                        <div className="fg">
                            <label className="fl">Full Name</label>
                            <div className="input-with-icon">
                                <span className="input-icon">👤</span>
                                <input 
                                    className="input-auth"
                                    type="text" 
                                    required 
                                    placeholder="e.g. Priya Sharma" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                        </div>
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

                        <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                            <input type="checkbox" required style={{ width: '16px', height: '16px', marginTop: '2px' }} />
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                I agree to the <a href="#" style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</a>.
                            </label>
                        </div>

                        <button className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '0.9rem', borderRadius: '14px' }} disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Create My Account →'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Log In Instead</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
