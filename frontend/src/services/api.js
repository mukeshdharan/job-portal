import axios from 'axios';

// Set up base Axios config
axios.defaults.baseURL = import.meta.env.VITE_API_URL;// Using Vite proxy
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const jobService = {
  getJobs: (params) => axios.get('/api/jobs', { params }).then(res => res.data),
  getJobById: (id) => axios.get(`/api/jobs/${id}`).then(res => res.data),
  createJob: (data) => axios.post('/api/jobs', data).then(res => res.data),
  updateJob: (id, data) => axios.put(`/api/jobs/${id}`, data).then(res => res.data),
  deleteJob: (id) => axios.delete(`/api/jobs/${id}`).then(res => res.data),
  toggleStatus: (id, status) => axios.patch(`/api/jobs/${id}/status`, { status }).then(res => res.data),
};

export const applicationService = {
  apply: (jobId) => axios.post('/api/applications', { jobId }).then(res => res.data),
  getApplications: () => axios.get('/api/applications').then(res => res.data),
  getApplicationById: (id) => axios.get(`/api/applications/${id}`).then(res => res.data),
  updateStatus: (id, status) => axios.patch(`/api/applications/${id}/status`, { status }).then(res => res.data),
};

export const interviewService = {
  schedule: (data) => axios.post('/api/interviews', data).then(res => res.data),
  getInterviews: () => axios.get('/api/interviews').then(res => res.data),
  updateStatus: (id, status, notes) => axios.patch(`/api/interviews/${id}`, { status, notes }).then(res => res.data),
};

export const profileService = {
  update: (data) => axios.put('/api/users/profile', data).then(res => res.data),
  uploadResume: (formData) => axios.post('/api/users/profile/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data),
  getAdminStats: () => axios.get('/api/users/admin/stats').then(res => res.data),
  getRecruiterStats: () => axios.get('/api/users/recruiter/stats').then(res => res.data)
};
