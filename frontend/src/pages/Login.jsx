import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand identity header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-550 text-white shadow-xl shadow-brand-550/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back to <span className="text-brand-550">HireStream</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage your recruitment workflows or apply to your dream job
          </p>
        </div>

        {/* Login Card Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-550 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-550/20 hover:bg-brand-700 focus:outline-none transition active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed credentials hints */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo Accounts (Password: password123)</h4>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button 
                type="button"
                onClick={() => { setEmail('admin@jobportal.com'); setPassword('password123'); }}
                className="rounded-lg border border-slate-100 p-2 text-left hover:bg-slate-50 transition"
              >
                <p className="text-[10px] font-bold text-slate-700">Admin Mode</p>
                <p className="text-[9px] text-slate-400">admin@jobportal.com</p>
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('recruiter@jobportal.com'); setPassword('password123'); }}
                className="rounded-lg border border-slate-100 p-2 text-left hover:bg-slate-50 transition"
              >
                <p className="text-[10px] font-bold text-slate-700">Recruiter Mode</p>
                <p className="text-[9px] text-slate-400">recruiter@jobportal.com</p>
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('candidate@jobportal.com'); setPassword('password123'); }}
                className="rounded-lg border border-slate-100 p-2 text-left hover:bg-slate-50 transition"
              >
                <p className="text-[10px] font-bold text-slate-700">Candidate Mode</p>
                <p className="text-[9px] text-slate-400">candidate@jobportal.com</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-550 hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
