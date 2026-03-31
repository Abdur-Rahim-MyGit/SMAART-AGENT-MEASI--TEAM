import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Login, 2: OTP

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!isLogin) {
                // Register logic (unchanged)
                await axios.post('http://localhost:5000/api/auth/register', formData);
                setIsLogin(true);
                alert("Account created successfully! Please log in.");
            } else if (step === 1) {
                // Login Step 1
                const res = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                if (res.data.requiresOTP) {
                    setStep(2);
                }
            } else {
                // Login Step 2: Verify OTP
                const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                    email: formData.email,
                    otp: otp
                });
                
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                
                const role = res.data.user?.role?.toLowerCase();
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'college_admin') {
                    navigate('/po');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || "Auth failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                
                <div className="text-center space-y-2 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
                        <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight italic">
                        {isLogin ? 'Mission Control' : 'Join the Vanguard'}
                    </h2>
                    <p className="text-text-secondary text-sm font-medium">
                        {isLogin ? 'Enter credentials to access your intelligence profile.' : 'Create an account to track your career trajectory.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                        <>
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                        <input 
                                            type="text" required className="input-field pl-10" placeholder="John Doe"
                                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                    <input 
                                        type="email" required className="input-field pl-10" placeholder="pilot@mission.com"
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                    <input 
                                        type="password" required className="input-field pl-10" placeholder="••••••••"
                                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-1">Verification Code (OTP)</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                                    <input 
                                        type="text" required className="input-field pl-10" placeholder="6-digit code" maxLength="6"
                                        value={otp} onChange={e => setOtp(e.target.value)} autoFocus
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-text-secondary font-medium text-center">
                                We've transmitted a secure code to {formData.email}
                            </p>
                            <button 
                                type="button" 
                                onClick={() => setStep(1)} 
                                className="text-[10px] font-black text-primary uppercase tracking-widest block mx-auto"
                            >
                                ← Return to Login
                            </button>
                        </div>
                    )}

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs text-center font-bold"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button disabled={loading} className="btn btn-primary w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] mt-6">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                        {loading ? 'Processing...' : !isLogin ? 'Create Registry' : step === 1 ? 'Get Launch Code' : 'Authorize Access'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-surface-border text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black text-text-secondary hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        {isLogin ? "New here? Create an Account" : "Registered? Sign In Instead"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
