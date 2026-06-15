import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/api';
import { 
  Users, 
  Briefcase, 
  FileCheck, 
  UserCheck, 
  Loader2, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const stats = await profileService.getAdminStats();
      setData(stats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
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

  const { stats, charts } = data;

  const statsList = [
    { label: 'Total Users', count: stats.totalUsers, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Recruiters', count: stats.totalRecruiters, icon: UserCheck, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Total Candidates', count: stats.totalCandidates, icon: Users, color: 'bg-rose-50 text-rose-600' },
    { label: 'Total Jobs Posted', count: stats.totalJobs, icon: Briefcase, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Applications', count: stats.totalApplications, icon: FileCheck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Jobs', count: stats.activeJobs, icon: Activity, color: 'bg-violet-50 text-violet-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Analytics</h2>
        <p className="text-sm text-slate-400">Real-time metrics, user growth trends and system activities overview</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsList.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} shadow-inner`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth Line Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-brand-550" />
            User Registration Growth
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4e73ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4e73ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#4e73ff" strokeWidth={2} fillOpacity={1} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications Monthly Volume Bar Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-emerald-550" />
            Job Applications Received
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.appGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs Posted Volume */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-violet-550" />
            Jobs Posted Trends
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.jobGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
