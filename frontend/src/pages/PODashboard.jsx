import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, Target, AlertTriangle, FileText, BarChart3, 
    Search, Filter, ChevronRight, LogOut, LayoutDashboard,
    PieChart, Briefcase, GraduationCap, MapPin
} from 'lucide-react';

const PODashboard = () => {
    const { collegeCode: urlCollegeCode } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overall');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const code = urlCollegeCode || localStorage.getItem('smaart_college_code') || 'all';
                const res = await fetch(`http://localhost:5000/api/po/${code}/dashboard`);
                const result = await res.json();
                if (result.success) {
                    setData(result); // Using the whole result object
                }
            } catch (err) {
                console.error('An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [urlCollegeCode]);

    if (loading) {
        return (
            <div id="screen-loading" style={{ background: 'var(--navy)' }}>
                <div style={{ maxWidth: '400px', width: '100%', padding: '3rem', background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '24px', textAlign: 'center' }}>
                    <div className="loading-logo" style={{ marginBottom: '1.5rem' }}>SM<span>A</span>ART</div>
                    <div className="loading-bar-wrap" style={{ width: '100%', marginBottom: '1rem' }}>
                        <div className="loading-bar-track">
                            <div className="loading-bar-fill" style={{ width: '70%', animation: 'loading-pulse 2s infinite' }}></div>
                        </div>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>Syncing Institutional Intelligence...</p>
                </div>
            </div>
        );
    }

    // Fallback data if API is down or no data yet
    const viewData = data || {
        totalStudents: 0,
        zones: { Green: 0, Amber: 0, Red: 0 },
        directions: {},
        students: []
    };

    const { totalStudents = 0, zones = { Green: 0, Amber: 0, Red: 0 }, directions = {}, students = [] } = viewData;
    const { Green = 0, Amber = 0, Red = 0 } = zones;
    const totalZones = Green + Amber + Red || totalStudents || 1;

    const greenPct = ((Green / totalZones) * 100).toFixed(1);
    const amberPct = ((Amber / totalZones) * 100).toFixed(1);
    const redPct = ((Red / totalZones) * 100).toFixed(1);

    const filteredStudents = students.filter(s => 
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', background: 'var(--navy)', height: 'calc(100vh - 56px)', color: 'var(--text1)', marginTop: '56px', overflow: 'hidden' }}>
            
            {/* ── SIDEBAR (PREMIUM SLIM) ── */}
            <aside style={{ width: '280px', borderRight: '1px solid var(--border)', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(30px)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }}></div>
                        Command Center
                    </div>
                </div>

                <nav style={{ padding: '1.25rem 0.75rem', flex: 1 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '0 0.85rem 0.75rem', letterSpacing: '0.05em' }}>Intelligence</div>
                    <NavItem icon={<PieChart size={18}/>} label="Executive Overview" active={activeTab === 'overall'} onClick={() => setActiveTab('overall')} />
                    <NavItem icon={<Users size={18}/>} label="Student Roster" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    <NavItem icon={<Target size={18}/>} label="Career Alignments" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    
                    <div style={{ marginTop: '2.5rem', fontSize: '0.62rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '0 0.85rem 0.75rem', letterSpacing: '0.05em' }}>Strategic Tools</div>
                    <NavItem icon={<FileText size={18}/>} label="Batch Reports" />
                    <NavItem icon={<Briefcase size={18}/>} label="Placement Pulse" />
                    <NavItem icon={<AlertTriangle size={18}/>} label="Interventions" count={Red} />
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: '#fff' }}>PO</div>
                          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '14px', height: '14px', background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--navy2)' }}></div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text1)' }}>Institutional Admin</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>SRM Placement Cell</div>
                        </div>
                    </div>
                    <button style={{ width: '100%', padding: '0.7rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                        <LogOut size={16} /> Logout Command
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ flex: 1, height: '100%', overflowY: 'auto', position: 'relative' }}>
                <header style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(15px)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>Institutional Career Intelligence</div>
                        <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <MapPin size={22} color="var(--accent)" />
                          {viewData?.collegeCode === 'all' ? "Global Network Intelligence" : `${viewData?.collegeCode || "Institutional"} Profile`}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <Search size={18} color="var(--muted)" />
                            <input 
                                type="text" 
                                placeholder="Search by student name or ID..." 
                                style={{ background: 'transparent', border: 'none', color: 'var(--text1)', fontSize: '0.85rem', outline: 'none', width: '280px' }} 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
                        <button style={{ background: 'var(--navy3)', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}>
                           <Filter size={18} color="var(--text2)" />
                        </button>
                    </div>
                </header>

                <div style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                    
                    {/* --- TAB: OVERALL --- */}
                    {activeTab === 'overall' && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <StatCard label="Analyzed Students" val={totalStudents} icon={<Users size={20} color="var(--accent)" />} subText="Institutional Total" trend="+12% Since Last Week" />
                                <StatCard label="Entry Ready" val={Green} icon={<Target size={20} color="var(--green)" />} subText="Matched to High Priority" trend="Optimal" />
                                <StatCard label="Skill Gaps" val={Amber} icon={<Briefcase size={20} color="var(--amber)" />} subText="Mapping Interventions" trend="Needs Attention" />
                                <StatCard label="At Risk" val={Red} icon={<AlertTriangle size={20} color="var(--red)" />} subText="Urgent Reviews Required" trend="10 New Priority" color="var(--red)"/>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
                                {/* Placement Potential Visualization */}
                                <div style={S.box}>
                                    <div style={S.boxHeader}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Collegiate Success Zone Distribution</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Cumulative institutional preparedness across corporate transition zones.</p>
                                    </div>
                                    <div style={{ marginTop: '3rem' }}>
                                        <div style={{ height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border)', padding: '4px' }}>
                                            <div style={{ width: `${greenPct}%`, background: 'var(--green)', height: '100%', borderRadius: '12px 0 0 12px', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
                                               {parseFloat(greenPct) > 10 && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, fontSize: '0.75rem', opacity: 0.8 }}>READY</span>}
                                            </div>
                                            <div style={{ width: `${amberPct}%`, background: 'var(--amber)', height: '100%', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                            <div style={{ width: `${redPct}%`, background: 'var(--red)', height: '100%', borderRadius: '0 12px 12px 0', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            <ZoneLegend color="var(--green)" label="Zone G (90%+ Match)" pct={greenPct} subText="Direct Placement Eligible" />
                                            <ZoneLegend color="var(--amber)" label="Zone A (60-89% Match)" pct={amberPct} subText="Intervention Recommended" />
                                            <ZoneLegend color="var(--red)" label="Zone R (<60% Match)" pct={redPct}  subText="Critical Skill Alignment"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Roles Career Pathways */}
                                <div style={S.box}>
                                    <div style={S.boxHeader}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Pathway Popularity</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Most targeted professions in this batch.</p>
                                    </div>
                                    <div style={{ marginTop: '2rem' }}>
                                        {Object.entries(directions).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([role, count], i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: 'var(--muted)' }}>{i+1}</div>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text1)' }}>{role}</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                  <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent)' }}>{count}</div>
                                                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>CANDIDATES</div>
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(directions).length === 0 && (
                                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                                                <GraduationCap size={40} style={{ opacity: 0.2, marginBottom: '1rem' }}/>
                                                <p>No career pathways analyzed yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Student Roster Excerpt */}
                            <div style={{ ...S.box, marginTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div style={S.boxHeader}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Real-time Intelligence Stream</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Live monitoring of processing analyzed career profiles.</p>
                                    </div>
                                    <button onClick={() => setActiveTab('students')} style={{ background: 'var(--navy3)', border: '1px solid var(--border)', color: 'var(--accent)', padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>View Full Database</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                          <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                              <th style={S.th}>Candidate Identifier</th>
                                              <th style={S.th}>Targeted Career Path</th>
                                              <th style={S.th}>Corporate Zone</th>
                                              <th style={S.th}>Processing Date</th>
                                              <th style={S.th}>Intelligence Access</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {students.slice(0, 8).map((s, i) => (
                                              <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                  <td style={S.td}>
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent), #473dc2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: '#fff', boxShadow: '0 4px 10px rgba(79,142,247,0.2)' }}>{s.name?.[0] || 'C'}</div>
                                                          <div>
                                                            <div style={{ fontWeight: 800, color: 'var(--text1)' }}>{s.name || "Anonymous Candidate"}</div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>UID: #{s.id?.slice(-8).toUpperCase() || "PENDING"}</div>
                                                          </div>
                                                      </div>
                                                  </td>
                                                  <td style={S.td}>
                                                     <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.direction || "Exploratory Phase"}</div>
                                                     <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Corporate Alignment Profile</div>
                                                  </td>
                                                  <td style={S.td}><ZoneBadge zone={s.zone || 'Amber'} /></td>
                                                  <td style={S.td}>
                                                     <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.lastActive ? new Date(s.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Processing...'}</div>
                                                  </td>
                                                  <td style={S.td}><button style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', padding: '0.4rem', borderRadius: '6px', color: 'var(--accent)', cursor: 'pointer' }}><ChevronRight size={18}/></button></td>
                                              </tr>
                                          ))}
                                          {students.length === 0 && (
                                              <tr>
                                                  <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                                      <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '1rem' }}>🗄️</div>
                                                      <div style={{ fontWeight: 800, color: 'var(--muted)' }}>No student records synchronized yet.</div>
                                                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Run student onboarding to populate institutional analytics.</div>
                                                  </td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: ROSTER (FULL DIRECTORY) --- */}
                    {activeTab === 'students' && (
                        <div className="animate-fade-in" style={S.box}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div>
                                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.4rem' }}>Institutional Student Roster</h3>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Managing {filteredStudents.length} synchronized career profiles.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button style={S.filterBtn}><Filter size={16} /> Batch Selection</button>
                                    <button style={{ ...S.filterBtn, background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}>Export Analytics (XLSX)</button>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                      <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                          <th style={S.th}>ID</th>
                                          <th style={S.th}>Candidate Profile</th>
                                          <th style={S.th}>Career Trajectory</th>
                                          <th style={S.th}>Institutional Zone</th>
                                          <th style={S.th}>Synchronization Status</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {filteredStudents.map((s, i) => (
                                          <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                              <td style={{ ...S.td, fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 800 }}>#{s.id?.slice(-8).toUpperCase() || (2000 + i)}</td>
                                              <td style={S.td}>
                                                  <div style={{ fontWeight: 800, color: 'var(--text1)', fontSize: '0.95rem' }}>{s.name || "Student Candidate"}</div>
                                                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Class of 2024-25</div>
                                              </td>
                                              <td style={S.td}>
                                                 <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.direction || "General Career Mapping"}</div>
                                                 <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600 }}>Verified Analytics</div>
                                              </td>
                                              <td style={S.td}><ZoneBadge zone={s.zone || 'Amber'} /></td>
                                              <td style={S.td}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600 }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }}></div>
                                                    Synced {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Today'}
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                      {filteredStudents.length === 0 && (
                                          <tr>
                                            <td colSpan="5" style={{ padding: '6rem', textAlign: 'center' }}>
                                              <Search size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }}/>
                                              <div style={{ fontWeight: 800, color: 'var(--muted)', fontSize: '1.2rem' }}>No Candidates Match Your Search</div>
                                              <div style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Try adjusting your keywords or filters.</div>
                                            </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

/* ── COMPONENTS ── */

const NavItem = ({ icon, label, active, onClick, count }) => (
    <button onClick={onClick} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
        padding: '0.9rem 1.1rem', borderRadius: '12px',
        background: active ? 'rgba(79,142,247,0.12)' : 'transparent',
        border: active ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent',
        color: active ? 'var(--text1)' : 'var(--muted)',
        fontSize: '0.9rem', fontWeight: active ? 900 : 500,
        cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: '0.4rem', justifyContent: 'space-between',
        boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ color: active ? 'var(--accent)' : 'inherit', transition: 'color 0.2s' }}>{icon}</span>
            {label}
        </div>
        {count > 0 && <span style={{ background: 'var(--red)', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: 900, boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)' }}>{count}</span>}
    </button>
);

const StatCard = ({ label, val, icon, subText, trend, color }) => (
    <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                {icon}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: color || 'var(--text1)', letterSpacing: '-0.02em' }}>{val}</div>
              {trend && <div style={{ fontSize: '0.65rem', fontWeight: 800, color: trend.includes('Optimal') ? 'var(--green)' : trend.includes('New') ? 'var(--red)' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-4px' }}>{trend}</div>}
            </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem', fontWeight: 500 }}>{subText}</div>
        </div>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: color || 'var(--accent)', opacity: 0.05, filter: 'blur(40px)', borderRadius: '50%' }}></div>
    </div>
);

const ZoneLegend = ({ color, label, pct, subText }) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, boxShadow: `0 0 8px ${color}33` }} />
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text1)' }}>{label}</div>
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: color }}>{pct}%</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, marginTop: '0.2rem' }}>{subText}</div>
    </div>
);

const ZoneBadge = ({ zone }) => {
    const colors = {
        Green: { bg: 'rgba(16,185,129,0.08)', text: '#10b981', border: 'rgba(16,185,129,0.25)', label: 'Corporate Ready' },
        Amber: { bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)', label: 'Skill Bridging' },
        Red: { bg: 'rgba(239,68,68,0.08)', text: '#ef4444', border: 'rgba(239,68,68,0.25)', label: 'Critical Path' },
    }[zone] || { bg: 'var(--navy3)', text: 'var(--muted)', border: 'var(--border)', label: 'Unknow Status' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ width: 'fit-content', fontSize: '0.62rem', fontWeight: 900, padding: '0.25rem 0.6rem', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {zone} ZONE
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 700, marginLeft: '2px' }}>{colors.label}</span>
        </div>
    );
};

const S = {
    box: { background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '28px', padding: '2.25rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' },
    boxHeader: { marginBottom: '0.5rem' },
    th: { padding: '1.4rem 1.25rem', fontSize: '0.68rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em' },
    td: { padding: '1.4rem 1.25rem', verticalAlign: 'middle' },
    filterBtn: { background: 'var(--navy3)', border: '1px solid var(--border)', color: 'var(--text1)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s' }
};

export default PODashboard;
