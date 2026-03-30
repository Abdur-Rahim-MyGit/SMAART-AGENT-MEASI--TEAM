import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="screen-onboard">
      <div className="onboard-header">
        <div className="hero-badge">
          <span className="pulse-dot"></span>
          AI-Powered Career Mapping
        </div>
        <h1>
          Build your <em>Career Intelligence</em><br/>Profile in 6 steps
        </h1>
        <p>Analysed against 225+ roles · 18,000+ degree-role mappings · live market data · 3 career paths</p>
        
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }} onClick={() => navigate('/onboarding')}>
            Start My Analysis →
          </button>
          <button className="btn-ghost" style={{ padding: '1rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '4rem auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="ri-card" style={{ textAlign: 'center' }}>
          <div className="ri-label" style={{ justifyContent: 'center' }}>📈 Market Demand</div>
          <div className="ri-value">Real-time salary and vacancy data from top Indian & Global regions.</div>
        </div>
        <div className="ri-card" style={{ textAlign: 'center' }}>
          <div className="ri-label" style={{ justifyContent: 'center' }}>🤖 ML Success Score</div>
          <div className="ri-value">Sophisticated matching engine to predict your fit for 225+ modern roles.</div>
        </div>
        <div className="ri-card" style={{ textAlign: 'center' }}>
          <div className="ri-label" style={{ justifyContent: 'center' }}>🗺️ 3-Path Roadmap</div>
          <div className="ri-value">Personalized learning paths for your Primary, Secondary, and Tertiary goals.</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
