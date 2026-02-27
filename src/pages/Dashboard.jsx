import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService, submissionService } from '../services/api';
import { BookOpen, CheckCircle2, Zap, Target, Star, Filter } from 'lucide-react';
import '../styles/components/_dashboard.scss';

const FILTERS = ['all', 'easy', 'medium', 'hard'];

export default function Dashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assignRes, progRes] = await Promise.all([
          assignmentService.getAll(),
          submissionService.getProgress(),
        ]);
        setAssignments(assignRes.data.assignments);
        setProgress(progRes.data.progress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? assignments : assignments.filter((a) => a.difficulty === filter);
  const firstName = user?.name?.split(' ')[0] || 'Student';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="spinner spinner--lg" />
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="welcome-text">
          Welcome back, <span>{firstName}</span> 👋
        </h1>
        <p className="welcome-sub">
          {progress?.completionPercent ?? 0}% of your SQL journey complete — keep going!
        </p>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="progress-bar" style={{ marginBottom: '2rem' }}>
          <div className="progress-bar__header">
            <span>Overall Progress</span>
            <span>{progress.completedAssignments} / {progress.totalAssignments} assignments</span>
          </div>
          <div className="progress-bar__track">
            <div className="progress-bar__fill" style={{ width: `${progress.completionPercent}%` }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--accent">
            <Zap size={20} />
          </div>
          <div className="stat-card__value">{progress?.totalPoints ?? user?.totalPoints ?? 0}</div>
          <div className="stat-card__label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--success">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card__value">{progress?.completedAssignments ?? 0}</div>
          <div className="stat-card__label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--warning">
            <Target size={20} />
          </div>
          <div className="stat-card__value">{progress?.accuracy ?? 0}%</div>
          <div className="stat-card__label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--info">
            <Star size={20} />
          </div>
          <div className="stat-card__value">{progress?.totalSubmissions ?? 0}</div>
          <div className="stat-card__label">Submissions</div>
        </div>
      </div>

      {/* Assignments */}
      <h2 className="dashboard__section-title">
        <BookOpen size={20} /> Assignments
      </h2>

      <div className="dashboard__filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-pill${filter === f ? ' filter-pill--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="dashboard__grid">
        {filtered.map((a) => (
          <Link key={a._id} to={`/practice/${a._id}`} className="assignment-card">
            <div className="assignment-card__header">
              <span className="assignment-card__topic">{a.topic}</span>
              <span className={`badge badge--${a.difficulty}`}>{a.difficulty}</span>
            </div>
            <div className="assignment-card__title">{a.title}</div>
            <div className="assignment-card__description">{a.description}</div>
            <div className="assignment-card__footer">
              <span className="assignment-card__points">⚡ {a.points} pts</span>
              <span className="assignment-card__status">
                {a.completed ? (
                  <><CheckCircle2 size={13} color="var(--c-success, #10b981)" /> Completed</>
                ) : (
                  '→ Start'
                )}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p>No assignments found for this filter.</p>
        </div>
      )}
    </div>
  );
}
