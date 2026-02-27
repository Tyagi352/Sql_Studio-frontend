import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import '../../styles/components/_layout.scss';

export default function Layout() {
  return (
    <div className="layout">
      <div className="layout__sidebar">
        <Sidebar />
      </div>
      <div className="layout__main">
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
