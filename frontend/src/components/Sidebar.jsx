import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserSquare2, 
  FileText, 
  User, 
  PlusCircle, 
  Search, 
  Users,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/', label: 'Search Jobs', icon: Search },
          { to: '/applications', label: 'All Applications', icon: FileText },
        ];
      case 'recruiter':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/jobs/new', label: 'Post a Job', icon: PlusCircle },
          { to: '/', label: 'My Jobs', icon: Briefcase },
          { to: '/applications', label: 'Applications', icon: FileText },
        ];
      case 'candidate':
        return [
          { to: '/dashboard', label: 'My Applications', icon: FileText },
          { to: '/', label: 'Find Jobs', icon: Search },
          { to: '/profile', label: 'My Profile', icon: User },
        ];
      default:
        return [
          { to: '/', label: 'Jobs', icon: Briefcase }
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 text-white md:flex">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-550 shadow-md">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          HireStream
        </span>
      </div>

      {/* Role Indicator Banner */}
      {user && (
        <div className="mx-4 mt-4 rounded-xl bg-slate-800/50 border border-slate-800/80 p-3">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Access Mode</p>
          <p className="text-sm font-semibold text-brand-300 capitalize">{user.role}</p>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-150 ${
                  isActive
                    ? 'bg-brand-550 text-white shadow-lg shadow-brand-550/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition duration-150"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
