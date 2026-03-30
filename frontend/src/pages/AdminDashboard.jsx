import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClaudeEngine from './ClaudeEngine';

const AdminDashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/drafts');
      setDrafts(res.data);
      const resHist = await axios.get('http://localhost:5000/api/admin/history');
      setHistory(resHist.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/admin/drafts/approve', { id });
      setDrafts(drafts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/admin/drafts/reject', { id });
      setDrafts(drafts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div id="screen-loading">
        <div className="loading-logo">SM<span>A</span>ART</div>
        <div className="loading-bar-wrap">
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: '40%' }}></div>
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Accessing Admin Vault...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', marginTop: '56px', overflowY: 'auto' }}>
      <header className="dash-header">
        <div className="dash-top">
          <div>
            <div className="dash-name">Admin <span>Control Panel</span></div>
            <div className="dash-meta">Knowledge Graph & Activity Logs</div>
          </div>
          <div className="hero-badge" style={{ margin: 0 }}>
            <span className="pulse-dot" style={{ background: 'var(--accent)' }}></span>
            System Health: Optimal
          </div>
        </div>

        <div className="role-tabs-bar">
          <button
            className={`rtab ${activeFilter === 'history' ? 'active' : ''}`}
            onClick={() => setActiveFilter('history')}
          >
            📜 Student Analysis Logs ({history.length})
          </button>
          <button
            className={`rtab ${activeFilter === 'claude' ? 'active' : ''}`}
            onClick={() => setActiveFilter('claude')}
            style={activeFilter === 'claude' ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(79,142,247,0.1)' } : {}}
          >
            🤖 Claude Engine
          </button>
          <button
            className={`rtab ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            🕒 Pending Reviews ({drafts.length})
          </button>
        </div>
      </header>

      <main className="dash-main">
        {/* ─── Claude Engine Tab ──────────────────────────────────── */}
        {activeFilter === 'claude' && (
          <div className="panel animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(124,58,237,0.2))',
                border: '1px solid rgba(79,142,247,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
              }}>🤖</div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Claude Engine</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>AI-powered data generation assistant • Powered by Claude 3.5 Sonnet</div>
              </div>
              <div className="hero-badge" style={{ marginLeft: 'auto', margin: 0 }}>
                <span className="pulse-dot" style={{ background: '#10b981' }}></span>
                Live API Connected
              </div>
            </div>
            <ClaudeEngine />
          </div>
        )}

        {/* ─── Pending Reviews Tab ────────────────────────────────── */}
        {activeFilter === 'pending' && (
          <div className="panel animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {drafts.length === 0 ? (
                <div className="ri-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>All Clear</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>No pending drafts require verification at this time.</div>
                </div>
              ) : (
                drafts.map(draft => (
                  <div key={draft.id} className="ri-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span className="ztag amber"></span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{draft.title}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.8rem' }}>
                        {draft.company} • {draft.location} • Source: <span style={{ color: 'var(--accent)' }}>{draft.source}</span>
                      </div>
                      <div className="tags" style={{ marginBottom: '1rem' }}>
                        {draft.required_skills?.map(s => (
                          <span key={s} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center' }}>
                      <button className="btn-primary" onClick={() => handleApprove(draft.id)} style={{ padding: '0.7rem 1.5rem' }}>Approve</button>
                      <button className="btn-ghost" onClick={() => handleReject(draft.id)} style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── Student Analysis Logs Tab ───────────────────────────── */}
        {activeFilter === 'history' && (
          <div className="panel animate-fade-in">
            <div className="ri-card" style={{ marginBottom: '1.5rem', background: 'rgba(79,142,247,0.05)', borderStyle: 'dashed' }}>
              <div className="ri-label">User Onboarding Activity</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                Below are the real-time logs of student analyses processed by the SMAART Career Intelligence Engine. Data is securely fetched from the primary PostgreSQL database.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.length === 0 ? (
                <div className="ri-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2rem' }}>📭</div>
                  <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>No Submissions Found</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Start an onboarding session to populate logs.</div>
                </div>
              ) : (
                history.map(record => (
                  <div key={record.id} className="ri-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{record.studentName}</div>
                      <div className="tag" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>{new Date(record.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                      <strong>Email:</strong> {record.studentEmail} | <strong>Target Role:</strong> <span style={{ color: 'var(--primary)' }}>{record.primaryRole}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <strong>Hash Tracker:</strong> {record.profileHash}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
