const { query } = require('../config/db');

exports.scheduleInterview = async (req, res) => {
  const { applicationId, scheduledTime, notes } = req.body;

  if (!applicationId || !scheduledTime) {
    return res.status(400).json({ message: 'Application ID and Scheduled Time are required.' });
  }

  try {
    const application = await query.get(
      `SELECT a.*, j.title as job_title, j.recruiter_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to schedule interviews for this application.' });
    }

    // Check if an interview is already scheduled
    const existing = await query.get('SELECT * FROM interviews WHERE application_id = ?', [applicationId]);
    
    let result;
    if (existing) {
      // Update existing
      result = await query.run(
        'UPDATE interviews SET scheduled_time = ?, status = ?, notes = ? WHERE id = ?',
        [scheduledTime, 'scheduled', notes || '', existing.id]
      );
    } else {
      // Create new
      result = await query.run(
        'INSERT INTO interviews (application_id, scheduled_time, status, notes) VALUES (?, ?, ?, ?)',
        [applicationId, scheduledTime, 'scheduled', notes || '']
      );
    }

    // Update Application status to interview_scheduled
    await query.run(
      "UPDATE applications SET status = 'interview_scheduled' WHERE id = ?",
      [applicationId]
    );

    // Notify candidate
    await query.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [
        application.candidate_id,
        `An interview has been scheduled for your application to "${application.job_title}" on ${new Date(scheduledTime).toLocaleString()}.`
      ]
    );

    res.status(201).json({
      message: 'Interview scheduled successfully.',
      interviewId: existing ? existing.id : result.id
    });
  } catch (error) {
    console.error('scheduleInterview error:', error);
    res.status(500).json({ message: 'Server error scheduling interview.' });
  }
};

exports.getInterviews = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let sql = '';
    let params = [];

    if (role === 'admin') {
      sql = `
        SELECT i.*, j.title as job_title, j.company_name, u.name as candidate_name, u.email as candidate_email
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.candidate_id = u.id
        ORDER BY i.scheduled_time ASC
      `;
    } else if (role === 'recruiter') {
      sql = `
        SELECT i.*, j.title as job_title, j.company_name, u.name as candidate_name, u.email as candidate_email
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.candidate_id = u.id
        WHERE j.recruiter_id = ?
        ORDER BY i.scheduled_time ASC
      `;
      params.push(userId);
    } else if (role === 'candidate') {
      sql = `
        SELECT i.*, j.title as job_title, j.company_name
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN jobs j ON a.job_id = j.id
        WHERE a.candidate_id = ?
        ORDER BY i.scheduled_time ASC
      `;
      params.push(userId);
    }

    const interviews = await query.all(sql, params);
    res.json(interviews);
  } catch (error) {
    console.error('getInterviews error:', error);
    res.status(500).json({ message: 'Server error retrieving interviews.' });
  }
};

exports.updateInterviewStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body; // 'scheduled', 'completed', 'passed', 'failed'

  if (!['scheduled', 'completed', 'passed', 'failed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid interview status.' });
  }

  try {
    const interview = await query.get(
      `SELECT i.*, j.recruiter_id, j.title as job_title, a.candidate_id
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       WHERE i.id = ?`,
      [id]
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview record not found.' });
    }

    if (interview.recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await query.run(
      'UPDATE interviews SET status = ?, notes = ? WHERE id = ?',
      [status, notes || interview.notes, id]
    );

    // Notify candidate
    await query.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [
        interview.candidate_id,
        `Your interview status for "${interview.job_title}" has been updated to: ${status.toUpperCase()}.`
      ]
    );

    res.json({ message: 'Interview status updated successfully.', status });
  } catch (error) {
    console.error('updateInterviewStatus error:', error);
    res.status(500).json({ message: 'Server error updating interview status.' });
  }
};
