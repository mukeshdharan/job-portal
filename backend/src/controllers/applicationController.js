const { query } = require('../config/db');

exports.applyForJob = async (req, res) => {
  const { jobId } = req.body;

  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required.' });
  }

  try {
    // Check if job exists and is open
    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job posting has been closed.' });
    }

    // Check if already applied
    const existingApp = await query.get(
      'SELECT * FROM applications WHERE job_id = ? AND candidate_id = ?',
      [jobId, req.user.id]
    );

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Check if resume exists in candidate profile
    const profile = await query.get('SELECT resume_url FROM candidates WHERE user_id = ?', [req.user.id]);
    if (!profile || !profile.resume_url) {
      return res.status(400).json({ message: 'Please upload your resume in your profile page before applying.' });
    }

    // Create application
    const result = await query.run(
      'INSERT INTO applications (job_id, candidate_id, status) VALUES (?, ?, ?)',
      [jobId, req.user.id, 'applied']
    );

    // Notify recruiter
    await query.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [job.recruiter_id, `A new application has been submitted for your job posting: "${job.title}" by ${req.user.name}.`]
    );

    res.status(201).json({
      message: 'Application submitted successfully.',
      applicationId: result.id
    });
  } catch (error) {
    console.error('applyForJob error:', error);
    res.status(500).json({ message: 'Server error processing application.' });
  }
};

exports.getApplications = async (req, res) => {
  const { role, id: userId } = req.user;

  try {
    let sql = '';
    let params = [];

    if (role === 'admin') {
      sql = `
        SELECT a.*, j.title as job_title, j.company_name, j.location, u.name as candidate_name, u.email as candidate_email
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.candidate_id = u.id
        ORDER BY a.applied_at DESC
      `;
    } else if (role === 'recruiter') {
      sql = `
        SELECT a.*, j.title as job_title, j.company_name, j.location, u.name as candidate_name, u.email as candidate_email, c.resume_url, c.phone, c.skills
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.candidate_id = u.id
        LEFT JOIN candidates c ON u.id = c.user_id
        WHERE j.recruiter_id = ?
        ORDER BY a.applied_at DESC
      `;
      params.push(userId);
    } else if (role === 'candidate') {
      sql = `
        SELECT a.*, j.title as job_title, j.company_name, j.location, j.salary_range
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.candidate_id = ?
        ORDER BY a.applied_at DESC
      `;
      params.push(userId);
    }

    const applications = await query.all(sql, params);
    res.json(applications);
  } catch (error) {
    console.error('getApplications error:', error);
    res.status(500).json({ message: 'Server error fetching applications.' });
  }
};

exports.getApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await query.get(
      `SELECT a.*, j.title as job_title, j.company_name, j.recruiter_id, u.name as candidate_name, u.email as candidate_email, c.phone, c.skills, c.education, c.experience, c.resume_url
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.candidate_id = u.id
       LEFT JOIN candidates c ON u.id = c.user_id
       WHERE a.id = ?`,
      [id]
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Auth validation
    if (
      req.user.role !== 'admin' &&
      application.candidate_id !== req.user.id &&
      application.recruiter_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Unauthorized access to application.' });
    }

    // Parse candidate education/experience
    if (application.education) {
      try { application.education = JSON.parse(application.education); } catch(e) { application.education = []; }
    }
    if (application.experience) {
      try { application.experience = JSON.parse(application.experience); } catch(e) { application.experience = []; }
    }

    // Fetch associated interview details
    const interview = await query.get('SELECT * FROM interviews WHERE application_id = ?', [id]);
    application.interview = interview || null;

    res.json(application);
  } catch (error) {
    console.error('getApplicationById error:', error);
    res.status(500).json({ message: 'Server error fetching application details.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'

  const allowedStatuses = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid application status.' });
  }

  try {
    const application = await query.get(
      `SELECT a.*, j.title as job_title, j.recruiter_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [id]
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Role check: Owner recruiter or Admin
    if (application.recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. You cannot update this application.' });
    }

    await query.run('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

    // Send notification to candidate
    const statusFormatted = status.replace('_', ' ').toUpperCase();
    await query.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [
        application.candidate_id,
        `Your application for the position "${application.job_title}" has been updated to: ${statusFormatted}.`
      ]
    );

    res.json({ message: 'Application status updated successfully.', status });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    res.status(500).json({ message: 'Server error updating application status.' });
  }
};
