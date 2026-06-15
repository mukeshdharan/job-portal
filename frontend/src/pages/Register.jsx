import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('candidate'); // 'candidate' or 'recruiter'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || (role === 'recruiter' && !companyName)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await register(name, email, password, role, companyName);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand identity header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-550 text-white shadow-xl shadow-brand-550/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Start hiring top talent or find your next software career path
          </p>
        </div>

        {/* Register Card Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100/50">
          {/* Role selector tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setRole('candidate'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition ${
                role === 'candidate'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="h-4 w-4" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => { setRole('recruiter'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition ${
                role === 'recruiter'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Recruiter
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="Jane Doe"
              />
            </div>

            {/* Company Name Field (Recruiter only) */}
            {role === 'recruiter' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-150">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="companyName">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                  placeholder="Tech Solutions Ltd."
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="jane@company.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="password">
                Password (min. 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-550 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-550/20 hover:bg-brand-700 focus:outline-none transition active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none mt-2"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Register
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-550 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
