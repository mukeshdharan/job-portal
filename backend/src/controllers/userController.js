const { query } = require('../config/db');

exports.updateProfile = async (req, res) => {
  const { role, id: userId } = req.user;

  try {
    if (role === 'candidate') {
      const { phone, skills, education, experience } = req.body;
      
      const eduString = typeof education === 'string' ? education : JSON.stringify(education || []);
      const expString = typeof experience === 'string' ? experience : JSON.stringify(experience || []);

      await query.run(
        `UPDATE candidates SET phone = ?, skills = ?, education = ?, experience = ?
         WHERE user_id = ?`,
        [phone || '', skills || '', eduString, expString, userId]
      );
      
      const updatedProfile = await query.get('SELECT * FROM candidates WHERE user_id = ?', [userId]);
      return res.json({ message: 'Profile updated successfully.', profile: updatedProfile });
    } 
    
    if (role === 'recruiter') {
      const { companyName, companyWebsite, companyLogo } = req.body;

      if (!companyName) {
        return res.status(400).json({ message: 'Company Name is required.' });
      }

      await query.run(
        `UPDATE recruiters SET company_name = ?, company_website = ?, company_logo = ?
         WHERE user_id = ?`,
        [companyName, companyWebsite || '', companyLogo || '', userId]
      );

      const updatedProfile = await query.get('SELECT * FROM recruiters WHERE user_id = ?', [userId]);
      return res.json({ message: 'Profile updated successfully.', profile: updatedProfile });
    }

    res.status(400).json({ message: 'Invalid role for profile updates.' });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    await query.run(
      'UPDATE candidates SET resume_url = ? WHERE user_id = ?',
      [fileUrl, req.user.id]
    );

    res.json({
      message: 'Resume uploaded successfully.',
      resumeUrl: fileUrl
    });
  } catch (error) {
    console.error('uploadResume error:', error);
    res.status(500).json({ message: 'Server error saving resume.' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await query.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    await query.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('markNotificationsRead error:', error);
    res.status(500).json({ message: 'Server error updating notifications.' });
  }
};

// Admin metrics and statistics
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await query.get("SELECT COUNT(*) as count FROM users");
    const totalRecruiters = await query.get("SELECT COUNT(*) as count FROM users WHERE role = 'recruiter'");
    const totalCandidates = await query.get("SELECT COUNT(*) as count FROM users WHERE role = 'candidate'");
    const totalJobs = await query.get("SELECT COUNT(*) as count FROM jobs");
    const activeJobs = await query.get("SELECT COUNT(*) as count FROM jobs WHERE status = 'open'");
    const totalApplications = await query.get("SELECT COUNT(*) as count FROM applications");

    // Analytics lists grouped by Month
    const userGrowth = await query.all(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM users
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);

    const appGrowth = await query.all(`
      SELECT strftime('%Y-%m', applied_at) as month, COUNT(*) as count
      FROM applications
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);

    const jobGrowth = await query.all(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM jobs
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        totalRecruiters: totalRecruiters.count,
        totalCandidates: totalCandidates.count,
        totalJobs: totalJobs.count,
        activeJobs: activeJobs.count,
        totalApplications: totalApplications.count
      },
      charts: {
        userGrowth,
        appGrowth,
        jobGrowth
      }
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: 'Server error retrieving system stats.' });
  }
};

// Recruiter metrics
exports.getRecruiterStats = async (req, res) => {
  const recruiterId = req.user.id;

  try {
    const activeJobs = await query.get(
      "SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ? AND status = 'open'",
      [recruiterId]
    );

    const totalApplications = await query.get(
      `SELECT COUNT(*) as count FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ?`,
      [recruiterId]
    );

    const shortlistedCandidates = await query.get(
      `SELECT COUNT(*) as count FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ? AND a.status = 'shortlisted'`,
      [recruiterId]
    );

    const interviewScheduled = await query.get(
      `SELECT COUNT(*) as count FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ? AND a.status = 'interview_scheduled'`,
      [recruiterId]
    );

    // Job Performance List (applications per job)
    const jobPerformance = await query.all(
      `SELECT j.id, j.title, j.status, COUNT(a.id) as application_count
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.recruiter_id = ?
       GROUP BY j.id`,
      [recruiterId]
    );

    res.json({
      stats: {
        activeJobs: activeJobs.count,
        totalApplications: totalApplications.count,
        shortlistedCandidates: shortlistedCandidates.count,
        interviewScheduled: interviewScheduled.count
      },
      jobPerformance
    });
  } catch (error) {
    console.error('getRecruiterStats error:', error);
    res.status(500).json({ message: 'Server error retrieving recruiter stats.' });
  }
};
