import React, { useState, useEffect } from 'react';
import { submissionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown } from 'lucide-react';
import '../styles/components/_dashboard.scss';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionService.getLeaderboard()
      .then((res) => setLeaders(res.data.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} color="#fbbf24" />;
    if (rank === 2) return <Medal size={18} color="#e2e8f0" />;
    if (rank === 3) return <Medal size={18} color="#f59e0b" />;
    return <span style={{ fontWeight: 700, color: '#64748b', minWidth: '18px', textAlign: 'center' }}>{rank}</span>;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="spinner spinner--lg" />
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="welcome-text"><span>Leaderboard</span> 🏆</h1>
        <p className="welcome-sub">Top SQL students ranked by total points</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {leaders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🏆</div>
            <p>No students on the leaderboard yet. Be the first!</p>
          </div>
        ) : (
          leaders.map((entry) => (
            <div
              key={entry.rank}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '1rem 1.5rem', gap: '1rem',
                borderBottom: '1px solid rgba(255,255,255,.06)',
                background: entry.isCurrentUser ? 'rgba(99,102,241,.08)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ width: '28px', display: 'flex', justifyContent: 'center' }}>
                {rankIcon(entry.rank)}
              </div>

              <div
                style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: entry.rank <= 3
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem', color: 'white',
                }}
              >
                {entry.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {entry.name}
                  {entry.isCurrentUser && <span className="badge badge--accent" style={{ fontSize: '0.65rem' }}>You</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {entry.completedCount} assignment{entry.completedCount !== 1 ? 's' : ''} completed
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#f59e0b' }}>
                  {entry.totalPoints}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  pts
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
