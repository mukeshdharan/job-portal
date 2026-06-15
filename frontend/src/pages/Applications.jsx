import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applicationService, interviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Loader2, 
  FileText, 
  UserCheck, 
  XOctagon, 
  Calendar, 
  ChevronRight, 
  Eye, 
  Download,
  AlertCircle
} from 'lucide-react';

const Applications = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeAppId = searchParams.get('details');

  const [applications, setApplications] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Interview Scheduling State
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (activeAppId) {
      fetchApplicationDetails(activeAppId);
    } else {
      setActiveApp(null);
    }
  }, [activeAppId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (appId) => {
    setLoadingDetails(true);
    try {
      const data = await applicationService.getApplicationById(appId);
      setActiveApp(data);
      setScheduleSuccess(false);
      setInterviewTime('');
      setInterviewNotes('');
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setActionLoading(true);
    try {
      await applicationService.updateStatus(appId, newStatus);
      // Refresh local lists
      setApplications(prev =>
        prev.map(a => a.id === parseInt(appId) ? { ...a, status: newStatus } : a)
      );
      if (activeApp && activeApp.id === parseInt(appId)) {
        setActiveApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewTime) return;

    setActionLoading(true);
    try {
      await interviewService.schedule({
        applicationId: activeApp.id,
        scheduledTime: interviewTime,
        notes: interviewNotes
      });
      setScheduleSuccess(true);
      // Refresh details to sync status
      fetchApplicationDetails(activeApp.id);
      fetchApplications();
    } catch (error) {
      alert('Error scheduling interview.');
    } finally {
      setActionLoading(false);
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
        <h2 className="text-2xl font-bold text-slate-900">Application Pipeline</h2>
        <p className="text-sm text-slate-400">Review profiles, download resumes, shortlist candidates, and schedule technical interviews</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Application Inbox List */}
        <div className={`space-y-3 lg:col-span-1 ${activeApp ? 'hidden lg:block' : ''}`}>
          <h3 className="text-sm font-bold text-slate-900 px-1">Inbox Applications</h3>
          
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
              No applications in your pipeline.
            </div>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSearchParams({ details: app.id })}
                  className={`w-full text-left rounded-2xl border p-4 transition shadow-sm ${
                    activeAppId === app.id.toString()
                      ? 'border-brand-550 bg-brand-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{app.candidate_name || user.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{app.job_title}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{app.company_name} • {app.location}</p>
                    </div>
                    <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold capitalize ${
                      app.status === 'shortlisted' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      app.status === 'selected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Application details review panel */}
        <div className="lg:col-span-2">
          {activeAppId ? (
            loadingDetails ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-brand-550" />
              </div>
            ) : activeApp ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                {/* Mobile Back to Inbox Button */}
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition lg:hidden mb-4"
                >
                  Back to Inbox List
                </button>

                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{activeApp.candidate_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeApp.candidate_email} • {activeApp.phone || 'No phone'}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      Applying for: <span className="text-brand-550">{activeApp.job_title}</span>
                    </p>
                  </div>
                  
                  {/* Quick Decision Panel for Recruiter */}
                  {user.role === 'recruiter' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(activeApp.id, 'shortlisted')}
                        disabled={actionLoading}
                        className="flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
                      >
                        <UserCheck className="h-4 w-4" />
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(activeApp.id, 'rejected')}
                        disabled={actionLoading}
                        className="flex items-center gap-1 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                      >
                        <XOctagon className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(activeApp.id, 'selected')}
                        disabled={actionLoading}
                        className="flex items-center gap-1 rounded-xl bg-emerald-550 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                      >
                        Select Candidate
                      </button>
                    </div>
                  )}
                </div>

                {/* Resume Download Box */}
                {activeApp.resume_url && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-8 w-8 text-brand-550" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Resume Document</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Click to preview candidate resume PDF</p>
                      </div>
                    </div>
                    <a
                      href={activeApp.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    >
                      <Download className="h-4 w-4 text-slate-400" />
                      View PDF
                    </a>
                  </div>
                )}

                {/* Candidate Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeApp.skills ? (
                      activeApp.skills.split(',').map((s, idx) => (
                        <span key={idx} className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {s.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Not specified.</span>
                    )}
                  </div>
                </div>

                {/* Education and Experience Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Education */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Education Details</h4>
                    {activeApp.education && activeApp.education.length > 0 ? (
                      activeApp.education.map((edu, idx) => (
                        <div key={idx} className="border-l-2 border-slate-200 pl-3">
                          <p className="text-xs font-bold text-slate-800">{edu.degree}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{edu.school} • {edu.year}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No education history details provided.</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Work Experience</h4>
                    {activeApp.experience && activeApp.experience.length > 0 ? (
                      activeApp.experience.map((exp, idx) => (
                        <div key={idx} className="border-l-2 border-slate-200 pl-3">
                          <p className="text-xs font-bold text-slate-800">{exp.role}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{exp.company} • {exp.duration}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No work experience details provided.</p>
                    )}
                  </div>
                </div>

                {/* Recruiter view: Schedule Interview Form */}
                {user.role === 'recruiter' && (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Calendar className="h-4.5 w-4.5 text-slate-400" />
                      Schedule Interview
                    </h4>

                    {scheduleSuccess ? (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800">
                        Interview scheduled successfully and notification sent to applicant!
                      </div>
                    ) : (
                      <form onSubmit={handleScheduleInterview} className="space-y-3 max-w-md">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Date & Time *</label>
                          <input
                            type="datetime-local"
                            required
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-brand-550"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Additional Notes</label>
                          <textarea
                            rows={3}
                            value={interviewNotes}
                            onChange={(e) => setInterviewNotes(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-brand-550"
                            placeholder="Add meeting link or instructions..."
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 transition"
                        >
                          Schedule Technical Interview
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
                Application details not found.
              </div>
            )
          ) : (
            <div className="hidden lg:flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              Select an application from the inbox list to review candidate details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
