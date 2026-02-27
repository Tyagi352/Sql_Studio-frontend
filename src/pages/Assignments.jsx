import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { assignmentService } from '../services/api';
import {
  BookOpen, Search, CheckCircle2, ChevronRight,
  Zap, Filter, BarChart3, Lock, FolderOpen,
  Award, PlayCircle
} from 'lucide-react';
import '../styles/components/_assignments.scss';

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

const TOPIC_ICONS = {
  'SELECT Basics': <BookOpen size={16} />,
  'WHERE Filtering': <Filter size={16} />,
  'ORDER BY': <BarChart3 size={16} />,
  'Aggregates': <Zap size={16} />,
  'GROUP BY': <FolderOpen size={16} />,
  'GROUP BY / HAVING': <FolderOpen size={16} />,
  'JOINs': <Link size={16} />,
  'Subqueries': <Lock size={16} />,
  'Complex Queries': <Award size={16} />,
};

// SVG Progress Ring Component
const ProgressRing = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="progress-ring">
      <circle
        stroke="rgba(255,255,255,0.1)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="progress-ring__circle"
      />
    </svg>
  );
};

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');

  useEffect(() => {
    assignmentService.getAll()
      .then((res) => setAssignments(res.data.assignments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchesDiff = difficulty === 'all' || a.difficulty === difficulty;
      const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
        || a.topic?.toLowerCase().includes(search.toLowerCase())
        || a.description?.toLowerCase().includes(search.toLowerCase());
      return matchesDiff && matchesSearch;
    });
  }, [assignments, difficulty, search]);

  // Group by topic for better organization
  const groupedTasks = useMemo(() => {
    if (search || difficulty !== 'all') return { 'Filtered Results': filtered };
    const groups = {};
    filtered.forEach(a => {
      const t = a.topic || 'Other';
      if (!groups[t]) groups[t] = [];
      groups[t].push(a);
    });
    return groups;
  }, [filtered, search, difficulty]);

  const stats = useMemo(() => ({
    total: assignments.length,
    completed: assignments.filter((a) => a.completed).length,
    easy: assignments.filter((a) => a.difficulty === 'easy').length,
    medium: assignments.filter((a) => a.difficulty === 'medium').length,
    hard: assignments.filter((a) => a.difficulty === 'hard').length,
    points: assignments.filter((a) => a.completed).reduce((s, a) => s + a.points, 0)
  }), [assignments]);

  const completionPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="assignments-page">
      {/* ── Header Dashboard ── */}
      <div className="assignments-dashboard">
        <div className="assignments-dashboard__main">
          <h1>
            <BookOpen size={28} className="icon-glow" />
            SQL Assignment Library
          </h1>
          <p>Master database queries through hands-on, interactive challenges designed for all skill levels.</p>
        </div>

        <div className="assignments-dashboard__stats">
          <div className="stat-card">
            <div className="stat-card__ring">
              <ProgressRing radius={28} stroke={4} progress={completionPct} />
              <span className="stat-card__ring-val">{completionPct}%</span>
            </div>
            <div className="stat-card__info">
              <span className="stat-card__label">Progress</span>
              <span className="stat-card__val">{stats.completed} <small>/ {stats.total}</small></span>
            </div>
          </div>

          <div className="stat-card stat-card--alt">
            <div className="stat-card__icon"><Award size={24} /></div>
            <div className="stat-card__info">
              <span className="stat-card__label">Total Points</span>
              <span className="stat-card__val text-accent">{stats.points}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="assignments-toolbar">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks, topics, keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-bar__clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="filters-group">
          <div className="filters-label"><Filter size={14} /> Difficulty:</div>
          <div className="filters-pills">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`filter-pill${difficulty === d ? ' filter-pill--active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                <span className={`dot dot--${d === 'all' ? 'accent' : d}`} />
                {d.charAt(0).toUpperCase() + d.slice(1)}
                {d !== 'all' && <span className="filter-pill__count">{stats[d]}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Overview Meta ── */}
      <div className="assignments-meta">
        <BarChart3 size={14} />
        {loading ? 'Loading library…' : `Showing ${filtered.length} assignment${filtered.length !== 1 ? 's' : ''}`}
      </div>

      {/* ── Loading State ── */}
      {loading ? (
        <div className="assignments-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="assignment-card assignment-card--skeleton">
              <div className="skeleton" style={{ height: '1.25rem', width: '30%', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '1.5rem', width: '80%', marginBottom: '0.75rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '95%', marginBottom: '0.25rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '85%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* ── Empty State ── */
        <div className="empty-state">
          <div className="empty-state__icon glow">🔍</div>
          <h3>No matches found</h3>
          <p>We couldn't find any assignments matching your criteria.</p>
          <button className="btn-primary mt-4" onClick={() => { setSearch(''); setDifficulty('all'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        /* ── Grouped Grid ── */
        <div className="assignments-layout">
          {Object.entries(groupedTasks).map(([topic, tasks]) => (
            <div key={topic} className="topic-group">
              <h2 className="topic-group__header">
                <span className="topic-group__icon">
                  {TOPIC_ICONS[topic] || <FolderOpen size={18} />}
                </span>
                {topic}
                <span className="topic-group__count">{tasks.length} tasks</span>
              </h2>

              <div className="assignments-grid">
                {tasks.map((a, idx) => (
                  <Link
                    key={a._id}
                    to={`/practice/${a._id}`}
                    className={`assignment-card ${a.completed ? 'assignment-card--completed' : ''}`}
                  >
                    {/* Status Top Strip */}
                    <div className="assignment-card__strip" />

                    <div className="assignment-card__header">
                      <div className="assignment-card__badges">
                        <span className={`badge badge--${a.difficulty}`}>{a.difficulty}</span>
                        <span className="badge badge--points"><Zap size={10} /> {a.points} pts</span>
                      </div>
                      <span className="assignment-card__number">#{String(idx + 1).padStart(2, '0')}</span>
                    </div>

                    <h3 className="assignment-card__title">{a.title}</h3>

                    <p className="assignment-card__desc">{a.description}</p>

                    <div className="assignment-card__footer">
                      {a.completed ? (
                        <div className="assignment-card__status assignment-card__status--success">
                          <CheckCircle2 size={16} /> Completed
                        </div>
                      ) : (
                        <div className="assignment-card__status assignment-card__status--pending">
                          <PlayCircle size={16} /> Start Challenge
                        </div>
                      )}

                      <div className="assignment-card__arrow">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
