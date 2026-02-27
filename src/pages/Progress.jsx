import React, { useState, useEffect } from 'react';
import { submissionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Target, Zap, TrendingUp, Trophy } from 'lucide-react';
import '../styles/components/_dashboard.scss';

export default function Progress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [progRes, subRes] = await Promise.all([
          submissionService.getProgress(),
          submissionService.getMine(),
        ]);
        setProgress(progRes.data.progress);
        setSubmissions(subRes.data.submissions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="spinner spinner--lg" />
    </div>
  );

  const diffs = ['easy', 'medium', 'hard'];

  return (
    <div className="dashboard" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="dashboard__header">
        <h1 className="welcome-text">Your <span>Progress</span></h1>
        <p className="welcome-sub">Track your SQL learning journey</p>
      </div>

      {/* Stat Cards */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--accent"><Zap size={20} /></div>
          <div className="stat-card__value">{progress?.totalPoints ?? 0}</div>
          <div className="stat-card__label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success"><CheckCircle2 size={20} /></div>
          <div className="stat-card__value">{progress?.completedAssignments ?? 0} / {progress?.totalAssignments ?? 0}</div>
          <div className="stat-card__label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><Target size={20} /></div>
          <div className="stat-card__value">{progress?.accuracy ?? 0}%</div>
          <div className="stat-card__label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info"><TrendingUp size={20} /></div>
          <div className="stat-card__value">{progress?.totalSubmissions ?? 0}</div>
          <div className="stat-card__label">Submissions</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="progress-bar" style={{ marginBottom: '2rem' }}>
        <div className="progress-bar__header">
          <span>Overall Completion</span>
          <span>{progress?.completionPercent ?? 0}%</span>
        </div>
        <div className="progress-bar__track">
          <div className="progress-bar__fill" style={{ width: `${progress?.completionPercent ?? 0}%` }} />
        </div>
      </div>

      {/* Per-difficulty breakdown */}
      <h2 className="dashboard__section-title"><Trophy size={18} /> By Difficulty</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {diffs.map((diff) => {
          const stat = progress?.difficultyStats?.[diff] || { total: 0, completed: 0 };
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          return (
            <div key={diff} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge badge--${diff}`}>{diff}</span>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    {stat.completed} / {stat.total} completed
                  </span>
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pct}%</span>
              </div>
              <div className="progress-bar__track">
                <div
                  className="progress-bar__fill"
                  style={{
                    width: `${pct}%`,
                    background: diff === 'easy' ? '#10b981' : diff === 'medium' ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent submissions */}
      <h2 className="dashboard__section-title">Recent Submissions</h2>
      {submissions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <p>No submissions yet. Start practicing!</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#1e2640', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                  {['Assignment', 'Topic', 'Status', 'Points', 'Time'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 15).map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 500 }}>{sub.assignment?.title || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{sub.assignment?.topic || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`status-pill status-pill--${sub.passed ? 'passed' : 'failed'}`}>
                        {sub.passed ? '✅ Passed' : '❌ Failed'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#f59e0b', fontWeight: 600 }}>+{sub.pointsEarned}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
