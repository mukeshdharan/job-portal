import React, { useState, useEffect } from 'react';
import { applicationService, interviewService } from '../../services/api';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Loader2,
  Clock,
  ExternalLink,
  MessageSquareQuote
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    setLoading(true);
    try {
      const apps = await applicationService.getApplications();
      setApplications(apps);

      const meetings = await interviewService.getInterviews();
      setInterviews(meetings);
    } catch (error) {
      console.error('Error fetching candidate dashboard data:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Applicant Space</h2>
        <p className="text-sm text-slate-400">Track application status timelines, review interview details, and find jobs</p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applied Positions</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{applications.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interviews Set</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{interviews.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Reviews</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {applications.filter(a => ['applied', 'under_review', 'shortlisted', 'interview_scheduled'].includes(a.status)).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Applications Status list */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900">My Application Submissions</h3>
          
          {applications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="mx-auto h-10 w-10 text-slate-200 mb-2" />
              <p className="text-xs">You haven't applied to any jobs yet.</p>
              <Link to="/" className="text-xs text-brand-550 font-bold hover:underline inline-block mt-2">Find a Job now</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 hover:text-brand-550 transition duration-150">
                      <Link to={`/jobs/${app.job_id}`}>{app.job_title}</Link>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{app.company_name} • {app.location}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
                      app.status === 'shortlisted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      app.status === 'interview_scheduled' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                      app.status === 'selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/jobs/${app.job_id}`}
                      className="text-slate-400 hover:text-brand-550 p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg transition"
                      title="View job listing"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interviews side panel list */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Interviews Calendar</h3>

          {interviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No interviews scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((meet) => (
                <div key={meet.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{meet.job_title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{meet.company_name}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-brand-550 font-semibold">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(meet.scheduled_time).toLocaleString()}</span>
                  </div>

                  {meet.notes && (
                    <div className="rounded-lg bg-white border border-slate-100 p-2 text-[10px] text-slate-500 leading-normal flex gap-1 items-start">
                      <MessageSquareQuote className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{meet.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
