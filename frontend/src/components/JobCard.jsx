import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Briefcase, ChevronRight } from 'lucide-react';

const JobCard = ({ job, showStatus = false }) => {
  const skills = job.skills_required ? job.skills_required.split(',').map(s => s.trim()) : [];

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md">
      <div>
        {/* Card Header: Job Title & Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-brand-550 transition duration-150 text-base md:text-lg">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{job.company_name}</p>
          </div>
          
          {showStatus && (
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              job.status === 'open' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {job.status === 'open' ? 'Active' : 'Closed'}
            </span>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            {job.location}
          </span>
          {job.salary_range && (
            <span className="flex items-center gap-0.5">
              <DollarSign className="h-4 w-4 text-slate-400" />
              {job.salary_range}
            </span>
          )}
          {job.experience_required && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-slate-400" />
              {job.experience_required}
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {job.description}
        </p>

        {/* Skills Tag Pills */}
        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 border border-slate-100"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="inline-flex rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-400">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action CTA Button */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          Posted {new Date(job.created_at).toLocaleDateString()}
        </span>

        <Link
          to={`/jobs/${job.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-brand-550 group-hover:text-brand-700 transition"
        >
          View Details
          <ChevronRight className="h-4 w-4 transition duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
