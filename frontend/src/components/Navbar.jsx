import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, Briefcase, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, notifications, markNotificationsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      {/* Brand logo in mobile, page title in desktop */}
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-brand-550 md:hidden" />
        <span className="text-xl font-bold text-slate-800 md:hidden">HireStream</span>
        <h1 className="hidden text-lg font-semibold text-slate-800 md:block">
          Welcome back, <span className="text-brand-550 font-bold">{user?.name}</span>
        </h1>
      </div>

      {/* Profile / Notifications actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                if (!showNotifications && unreadCount > 0) {
                  markNotificationsRead();
                }
              }}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <Bell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-100 bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2">
                  <span className="text-sm font-semibold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-brand-550 font-medium">{unreadCount} new</span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`border-b border-slate-50 px-4 py-3 text-xs last:border-b-0 hover:bg-slate-50 transition ${
                          !n.is_read ? 'bg-brand-50/40 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <p className="leading-normal">{n.message}</p>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3 hover:bg-slate-50 transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-550 text-sm font-semibold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold text-slate-700">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-400 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 truncate">{user.email}</p>
                </div>
                
                {user.role === 'candidate' && (
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-brand-550 transition"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition border-t border-slate-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
