import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { 
  User, 
  Phone, 
  Code, 
  GraduationCap, 
  Briefcase, 
  Upload, 
  FileText, 
  Trash2, 
  Plus,
  Loader2,
  CheckCircle2,
  Globe
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfileLocal } = useAuth();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Candidate States
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [skills, setSkills] = useState(user?.profile?.skills || '');
  
  const [education, setEducation] = useState(user?.profile?.education || []);
  const [experience, setExperience] = useState(user?.profile?.experience || []);

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // 2. Recruiter States
  const [companyName, setCompanyName] = useState(user?.profile?.company_name || '');
  const [companyWebsite, setCompanyWebsite] = useState(user?.profile?.company_website || '');

  // Synchronize with Auth state updates
  useEffect(() => {
    if (user) {
      if (user.role === 'candidate') {
        setPhone(user.profile?.phone || '');
        setSkills(user.profile?.skills || '');
        setEducation(user.profile?.education || []);
        setExperience(user.profile?.experience || []);
      } else if (user.role === 'recruiter') {
        setCompanyName(user.profile?.company_name || '');
        setCompanyWebsite(user.profile?.company_website || '');
      }
    }
  }, [user]);

  // Candidate Education Helpers
  const addEducationRow = () => {
    setEducation([...education, { degree: '', school: '', year: '' }]);
  };
  const removeEducationRow = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const handleEducationChange = (index, field, value) => {
    setEducation(prev =>
      prev.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    );
  };

  // Candidate Experience Helpers
  const addExperienceRow = () => {
    setExperience([...experience, { role: '', company: '', duration: '' }]);
  };
  const removeExperienceRow = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const handleExperienceChange = (index, field, value) => {
    setExperience(prev =>
      prev.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    );
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let data = {};
      if (user.role === 'candidate') {
        data = { phone, skills, education, experience };
      } else {
        data = { companyName, companyWebsite };
      }

      const res = await profileService.update(data);
      updateProfileLocal(res.profile);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await profileService.uploadResume(formData);
      updateProfileLocal({
        ...user.profile,
        resume_url: res.resumeUrl
      });
      setSuccessMsg('Resume PDF uploaded successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error uploading file.');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile Management</h2>
        <p className="text-sm text-slate-400">Keep your details up to date to boost application responses</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {successMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* USER SPECIFIC: Candidate Profile Forms */}
          {user?.role === 'candidate' && (
            <>
              {/* Phone and Skills */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-xs text-slate-800 focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550 transition"
                    placeholder="+1 555-123-4567"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                    <Code className="h-4 w-4 text-slate-400" />
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-xs text-slate-800 focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550 transition"
                    placeholder="React, Express, SQLite, Node.js"
                  />
                </div>
              </div>

              {/* Resume Upload Card */}
              <div className="border-t border-slate-100 pt-6">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Resume Document (.pdf, .doc, .docx)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <FileText className="h-10 w-10 text-brand-400" />
                  
                  <div className="flex-1 text-center sm:text-left">
                    {user?.profile?.resume_url ? (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Resume Uploaded</p>
                        <a
                          href={
                            // Handle base64 data URLs (new) and old relative /uploads/ paths
                            user.profile.resume_url.startsWith('data:')
                              ? user.profile.resume_url
                              : `${import.meta.env.VITE_API_URL || ''}${user.profile.resume_url}`
                          }
                          download="resume"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-brand-550 hover:underline inline-block mt-0.5"
                        >
                          View / Download Resume
                        </a>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-500">No Resume Uploaded</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Please upload a resume to enable job applications</p>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="resume-file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-file"
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    >
                      {uploadingResume ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-slate-400" />
                      )}
                      Upload Resume
                    </label>
                  </div>
                </div>
              </div>

              {/* Dynamic Education Table */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <GraduationCap className="h-5.5 w-5.5 text-slate-400" />
                    Education Details
                  </h4>
                  <button
                    type="button"
                    onClick={addEducationRow}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-550 hover:text-brand-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Degree
                  </button>
                </div>

                {education.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">No education history added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {education.map((edu, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end border border-slate-100 bg-slate-50/20 p-3 rounded-xl">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Degree / Major</label>
                          <input
                            type="text"
                            value={edu.degree}
                            required
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-brand-550"
                            placeholder="B.S. Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">School / University</label>
                          <input
                            type="text"
                            value={edu.school}
                            required
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-brand-550"
                            placeholder="State University"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-[10px] text-slate-500 mb-1">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.year}
                              required
                              onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-brand-550"
                              placeholder="2025"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEducationRow(index)}
                            className="text-red-500 hover:text-red-700 p-2 border border-slate-100 rounded-lg hover:bg-slate-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Experience Table */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Briefcase className="h-5.5 w-5.5 text-slate-400" />
                    Work Experience
                  </h4>
                  <button
                    type="button"
                    onClick={addExperienceRow}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-550 hover:text-brand-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Job
                  </button>
                </div>

                {experience.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">No work experience added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {experience.map((exp, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-3 items-end border border-slate-100 bg-slate-50/20 p-3 rounded-xl">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Job Title / Role</label>
                          <input
                            type="text"
                            value={exp.role}
                            required
                            onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-brand-550"
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            required
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-brand-550"
                            placeholder="Acme Corp"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-[10px] text-slate-500 mb-1">Duration</label>
                            <input
                              type="text"
                              value={exp.duration}
                              required
                              onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-brand-550"
                              placeholder="e.g. 2 Years, 6 Mos"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperienceRow(index)}
                            className="text-red-500 hover:text-red-700 p-2 border border-slate-100 rounded-lg hover:bg-slate-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* USER SPECIFIC: Recruiter Profile Forms */}
          {user?.role === 'recruiter' && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-xs text-slate-800 focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550 transition"
                  placeholder="Tech Solutions Ltd."
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Company Website
                </label>
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-xs text-slate-800 focus:border-brand-550 focus:outline-none focus:ring-1 focus:ring-brand-550 transition"
                  placeholder="https://company.com"
                />
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-550 py-3 text-xs font-semibold text-white shadow-lg shadow-brand-550/20 hover:bg-brand-700 transition active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Save Profile Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
