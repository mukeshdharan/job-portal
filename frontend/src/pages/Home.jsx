import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/api';
import JobCard from '../components/JobCard';
import { Search, MapPin, SlidersHorizontal, Loader2, ArrowLeft, ArrowRight, Eye, Edit, Trash, Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Recruiter specific listings state
  const [recruiterJobs, setRecruiterJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, [page, user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (user?.role === 'recruiter') {
        // Fetch all jobs, then filter locally for simplicity, or query
        const data = await jobService.getJobs({ status: '', limit: 100 });
        const myJobs = data.jobs.filter(j => j.recruiter_id === user.id);
        setRecruiterJobs(myJobs);
      } else {
        // Candidate or Admin or Guest
        const data = await jobService.getJobs({
          search,
          location,
          skills,
          status: user?.role === 'admin' ? '' : 'open',
          page,
          limit: 6
        });
        setJobs(data.jobs);
        setTotalPages(data.pagination.totalPages);
        setTotalJobs(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await jobService.toggleStatus(jobId, nextStatus);
      setRecruiterJobs(prev =>
        prev.map(j => j.id === jobId ? { ...j, status: nextStatus } : j)
      );
    } catch (error) {
      alert('Error updating job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action is permanent.')) {
      return;
    }
    try {
      await jobService.deleteJob(jobId);
      setRecruiterJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (error) {
      alert('Error deleting job listing.');
    }
  };

  // 1. Recruiter View
  if (user?.role === 'recruiter') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manage Job Listings</h2>
            <p className="text-sm text-slate-400">Add, edit, close, or review candidates for your active jobs</p>
          </div>
          <Link
            to="/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-brand-550 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-550/20 hover:bg-brand-700 transition"
          >
            <Plus className="h-4 w-4" />
            Post New Job
          </Link>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-550" />
          </div>
        ) : recruiterJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No jobs posted yet</h3>
            <p className="mt-2 text-xs text-slate-400">Post your first listing to start accepting candidate applications</p>
            <Link
              to="/jobs/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Salary Range</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {recruiterJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-800 hover:text-brand-550">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{job.location}</td>
                      <td className="px-6 py-4 text-slate-500">{job.salary_range || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(job.id, job.status)}
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-85 ${
                            job.status === 'open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {job.status === 'open' ? 'Active' : 'Closed'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                            title="View job posting"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Link>
                          <Link
                            to={`/jobs/new?edit=${job.id}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-550 transition"
                            title="Edit details"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete job posting"
                          >
                            <Trash className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Candidate / Guest / Admin View (Job Board Grid)
  return (
    <div className="space-y-6">
      {/* Header and Search section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Explore Open Positions</h2>
          <p className="text-sm text-slate-400">Discover and apply to technical listings curated daily</p>
        </div>
      </div>

      {/* Advanced search filters */}
      <form onSubmit={handleSearchSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search title, skills or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-3 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-brand-550 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-550 transition"
            />
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <MapPin className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Location (e.g. Remote, Hybrid)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-3 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-brand-550 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-550 transition"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition duration-150 active:scale-[0.98]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </form>

      {/* Jobs results */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-550" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No jobs found</h3>
          <p className="mt-2 text-xs text-slate-400">Try adjusting your filters or search keywords</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} showStatus={user?.role === 'admin'} />
            ))}
          </div>

          {/* Pagination panel */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <span className="text-xs text-slate-400">
                Showing page {page} of {totalPages} ({totalJobs} total jobs)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:hover:bg-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
