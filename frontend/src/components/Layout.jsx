import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('smaart-theme') === 'light');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('smaart-theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  const goToDashboard = () => {
    const id = localStorage.getItem('smaart_analysis_id');
    if (id) navigate('/dashboard');
    else navigate('/onboarding');
  };

  const handleLogout = () => {
    localStorage.removeItem('smaart_token');
    localStorage.removeItem('smaart_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('smaart_analysis_id');
    localStorage.removeItem('smaart_college_code');
    navigate('/login');
  };

  const isLoggedIn = !!(localStorage.getItem('smaart_token') || localStorage.getItem('token'));

  const user = JSON.parse(localStorage.getItem('smaart_user') || localStorage.getItem('user') || '{}');
  const role = user.role?.toLowerCase();

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <nav>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          SM<span className="logo-a">A</span>ART <span className="logo-badge">v1.0</span>
        </div>
        
        <div className="nav-links">
          <button className="nav-link-item" onClick={() => navigate('/')}>
            <span className="nav-link-icon">⬡</span>Home
          </button>
          
          {isLoggedIn && (
            <>
              {(!role || role === 'student') && (
                <>
                  <button 
                    className="nav-link-item" 
                    onClick={() => {
                      if (localStorage.getItem('smaart_analysis_id')) navigate('/dashboard');
                      else navigate('/onboarding');
                    }}
                  >
                    <span className="nav-link-icon">📈</span>Market Insights
                  </button>
                  <button 
                    className="nav-link-item"
                    onClick={() => {
                      if (localStorage.getItem('smaart_analysis_id')) navigate('/passport');
                      else alert('Complete your career profile first to generate your Passport.');
                    }}
                  >
                    <span className="nav-link-icon">🎫</span>Career Passport
                  </button>
                </>
              )}
              {role === 'admin' && (
                <button className="nav-link-item" onClick={() => navigate('/admin')}>
                  <span className="nav-link-icon">⚙️</span>Admin
                </button>
              )}
              {role === 'college_admin' && (
                <button className="nav-link-item" onClick={() => navigate('/po')}>
                  <span className="nav-link-icon">🏫</span>PO View
                </button>
              )}
            </>
          )}
        </div>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={() => setIsLight(p => !p)} title="Toggle theme">
            <span className="theme-toggle-icon">{isLight ? '☀️' : '🌙'}</span>
            <span id="themeLabel">{isLight ? 'Light' : 'Dark'}</span>
          </button>
          {isLoggedIn ? (
            <>
              <button className="btn-ghost" onClick={handleLogout} style={{ color: 'var(--red)' }}>
                Logout
              </button>
              {(!role || role === 'student') && (
                <button className="btn-primary" onClick={goToDashboard}>
                  View Dashboard →
                </button>
              )}
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* ===== PAGE CONTENT ===== */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>

    </div>
  );
};

export default Layout;
