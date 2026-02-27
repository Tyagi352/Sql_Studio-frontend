import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, TrendingUp, Trophy, LogOut, Database } from 'lucide-react';
import '../../styles/components/_sidebar.scss';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Assignments', path: '/assignments' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar__brand">
        <div className="brand-icon"><Database size={20} color="white" /></div>
        <div className="brand-text">
          <span className="brand-name">CipherSQL</span>
          <span className="brand-sub">Studio</span>
        </div>
      </NavLink>

      <nav className="sidebar__nav">
        <div className="sidebar__section-label">Main Menu</div>
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
            }
          >
            <Icon className="nav-icon" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="user-card">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Student'}</div>
              <div className="user-points">⚡ {user?.totalPoints || 0} pts</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
