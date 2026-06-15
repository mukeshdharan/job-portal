import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/api';
import { 
  Briefcase, 
  FileText, 
  UserCheck, 
  Calendar, 
  Loader2,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecruiterStats();
  }, []);

  const fetchRecruiterStats = async () => {
    setLoading(true);
    try {
      const stats = await profileService.getRecruiterStats();
      setData(stats);
    } catch (error) {
      console.error('Error fetching recruiter stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-550" />
      </div>
    );
  }

  const { stats, jobPerformance } = data;

  const statsList = [
    { label: 'Active Job Listings', count: stats.activeJobs, icon: Briefcase, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Applications', count: stats.totalApplications, icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Shortlisted Candidates', count: stats.shortlistedCandidates, icon: UserCheck, color: 'bg-amber-50 text-amber-600' },
    { label: 'Interviews Scheduled', count: stats.interviewScheduled, icon: Calendar, color: 'bg-cyan-50 text-cyan-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Recruiter Console</h2>
        <p className="text-sm text-slate-400">Track active recruitment pipelines, review applications, and plan technical evaluations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsList.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color} shadow-inner`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{stat.count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Bar Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-brand-550" />
            Job Performance (Applications per Job)
          </h3>
          
          {jobPerformance.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12">No data available. Post a job listing to see performance metrics.</p>
          ) : (
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="title" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="application_count" fill="#4e73ff" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Quick Operations</h3>
          <div className="space-y-2.5">
            <Link
              to="/jobs/new"
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-550 transition"
            >
              Post a New Job
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              to="/applications"
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-550 transition"
            >
              Review Applications Inbox
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              to="/"
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-550 transition"
            >
              View My Job Listings
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
