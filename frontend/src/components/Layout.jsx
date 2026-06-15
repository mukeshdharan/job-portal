import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Search, FileText, User, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getMobileLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/', label: 'Jobs', icon: Search },
        ];
      case 'recruiter':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/', label: 'Jobs', icon: Search },
          { to: '/applications', label: 'Apps', icon: FileText },
        ];
      case 'candidate':
        return [
          { to: '/dashboard', label: 'Apps', icon: FileText },
          { to: '/', label: 'Jobs', icon: Search },
          { to: '/profile', label: 'Profile', icon: User },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Bar */}
        {user && (
          <nav className="flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white md:hidden">
            {getMobileLinks().map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
                      isActive ? 'text-brand-550' : 'text-slate-400'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
