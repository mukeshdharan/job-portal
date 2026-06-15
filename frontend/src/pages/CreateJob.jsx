import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jobService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Loader2, ArrowLeft, Plus } from 'lucide-react';

const CreateJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(user?.profile?.company_name || '');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editJobId) {
      fetchJobToEdit();
    }
  }, [editJobId]);

  const fetchJobToEdit = async () => {
    setFetchingJob(true);
    try {
      const job = await jobService.getJobById(editJobId);
      setTitle(job.title);
      setCompanyName(job.company_name);
      setLocation(job.location);
      setSalaryRange(job.salary_range);
      setSkillsRequired(job.skills_required);
      setExperienceRequired(job.experience_required);
      setDescription(job.description);
    } catch (err) {
      setError('Error fetching job details for editing.');
    } finally {
      setFetchingJob(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !companyName || !location || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title,
      companyName,
      location,
      salaryRange,
      skillsRequired,
      experienceRequired,
      description
    };

    try {
      if (editJobId) {
        await jobService.updateJob(editJobId, payload);
      } else {
        await jobService.createJob(payload);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving job posting.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-550" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel and Go Back
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          {editJobId ? 'Edit Job Posting' : 'Post a New Job'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specify technical details, description and skills needed for the role
        </p>

        <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="Senior Frontend Developer"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="Tech Corp Ltd."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="San Francisco, CA (Remote)"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Salary Range
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="e.g. $100,000 - $130,000"
              />
            </div>

            {/* Experience Required */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Experience Level
              </label>
              <input
                type="text"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="e.g. 3+ Years, Mid-Senior"
              />
            </div>

            {/* Skills Required */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Skills Required (Comma separated)
              </label>
              <input
                type="text"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
                placeholder="React, Redux, Tailwind CSS"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Job Description *
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550"
              placeholder="Outline role responsibilities, benefits, and specifications..."
            />
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-550 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-550/20 hover:bg-brand-700 transition active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {editJobId ? 'Update Posting' : 'Post Listing'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
