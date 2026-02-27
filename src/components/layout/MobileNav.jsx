import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, TrendingUp, Trophy, Menu, Database } from 'lucide-react';
import '../../styles/components/_sidebar.scss';

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: BookOpen, label: 'Learn', path: '/assignments' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Trophy, label: 'Board', path: '/leaderboard' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {mobileNavItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`
          }
        >
          <Icon className="mobile-nav__icon" size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
