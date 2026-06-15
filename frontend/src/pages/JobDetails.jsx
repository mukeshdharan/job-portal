import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService, applicationService } from '../services/api';
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileDown,
  UserCheck
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // Track if this candidate has already applied to this job
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);

  // Recruiter: applications for this job
  const [jobApplications, setJobApplications] = useState([]);

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await jobService.getJobById(id);
      setJob(data);

      if (user) {
        // Fetch all applications to check state
        const apps = await applicationService.getApplications();
        const existing = apps.find(a => a.job_id === parseInt(id));
        if (existing) {
          setAlreadyApplied(true);
          setApplicationDetails(existing);
        }

        // If recruiter, get candidate applications for this specific job
        if (user.role === 'recruiter' || user.role === 'admin') {
          const matchingApps = apps.filter(a => a.job_id === parseInt(id));
          setJobApplications(matchingApps);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load job details. The listing may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      setError('Only candidates can apply for jobs.');
      return;
    }

    setIsApplying(true);
    setError('');
    try {
      await applicationService.apply(job.id);
      setApplySuccess(true);
      setAlreadyApplied(true);
      fetchJobDetails(); // Refresh details
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-550" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ChevronLeft className="h-4 w-4" />
          Back to Listings
        </Link>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <h3 className="font-semibold text-sm">{error}</h3>
        </div>
      </div>
    );
  }

  const skills = job.skills_required ? job.skills_required.split(',').map(s => s.trim()) : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
        <ChevronLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Job description card */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3 ${
                  job.status === 'open' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {job.status === 'open' ? 'Active Posting' : 'Closed'}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">{job.company_name}</p>
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-slate-400" />
                {job.salary_range || 'Not Disclosed'}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                {job.experience_required || 'Not Specified'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Rich job description */}
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Job Description</h4>
              <p className="text-xs leading-relaxed text-slate-500 whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Skills checklist */}
            {skills.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 border border-brand-100/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recruiter view: applicants tracking list */}
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Received Applications ({jobApplications.length})</h3>
              
              {jobApplications.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No applications received yet for this listing.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {jobApplications.map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{app.candidate_name}</p>
                        <p className="text-[10px] text-slate-400">{app.candidate_email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize ${
                          app.status === 'shortlisted' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          app.status === 'selected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <Link
                          to={`/applications?details=${app.id}`}
                          className="text-xs font-semibold text-brand-550 hover:underline"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar apply actions card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Application Window</h3>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {job.status !== 'open' ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center border border-slate-200">
                <p className="text-xs font-semibold text-slate-500">This job application is closed.</p>
              </div>
            ) : alreadyApplied ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 p-4 text-xs font-semibold text-brand-700 border border-brand-200">
                  <CheckCircle2 className="h-5 w-5 text-brand-550 shrink-0" />
                  <div>
                    <p>Already Applied</p>
                    <p className="text-[10px] text-brand-500 font-normal mt-0.5">
                      Status: <span className="font-bold capitalize">{applicationDetails?.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Track Application Status
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-550 py-3 text-xs font-semibold text-white shadow-lg shadow-brand-550/20 hover:bg-brand-700 focus:outline-none transition active:scale-[0.98] disabled:bg-slate-300"
                >
                  {isApplying ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <UserCheck className="h-4.5 w-4.5" />
                      Apply for this Job
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Important: Applying submits your saved profile skills, education details, and resume PDF to the recruiter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
