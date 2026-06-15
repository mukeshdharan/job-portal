const { query } = require('../config/db');

exports.getJobs = async (req, res) => {
  const { search, location, skills, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR company_name LIKE ? OR description LIKE ?)';
    const searchVal = `%${search}%`;
    params.push(searchVal, searchVal, searchVal);
  }

  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }

  if (skills) {
    sql += ' AND skills_required LIKE ?';
    params.push(`%${skills}%`);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  } else {
    // Default show only open jobs for standard search unless explicitly specified
    sql += ' AND status = ?';
    params.push('open');
  }

  try {
    // Count total matches
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalCountRow = await query.get(countSql, params);
    const total = totalCountRow.count;

    // Get paginated jobs
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const jobs = await query.all(sql, params);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('getJobs error:', error);
    res.status(500).json({ message: 'Server error retrieving jobs.' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    res.json(job);
  } catch (error) {
    console.error('getJobById error:', error);
    res.status(500).json({ message: 'Server error retrieving job details.' });
  }
};

exports.createJob = async (req, res) => {
  const { title, companyName, location, salaryRange, skillsRequired, experienceRequired, description } = req.body;

  if (!title || !companyName || !location || !description) {
    return res.status(400).json({ message: 'Required fields: Title, Company Name, Location, Description' });
  }

  try {
    const result = await query.run(
      `INSERT INTO jobs (recruiter_id, title, company_name, location, salary_range, skills_required, experience_required, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        companyName,
        location,
        salaryRange || '',
        skillsRequired || '',
        experienceRequired || '',
        description
      ]
    );

    const newJob = await query.get('SELECT * FROM jobs WHERE id = ?', [result.id]);
    res.status(201).json(newJob);
  } catch (error) {
    console.error('createJob error:', error);
    res.status(500).json({ message: 'Server error creating job listing.' });
  }
};

exports.updateJob = async (req, res) => {
  const { id } = req.params;
  const { title, companyName, location, salaryRange, skillsRequired, experienceRequired, description } = req.body;

  try {
    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Authorization: Must be owner or admin
    if (job.recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this job.' });
    }

    await query.run(
      `UPDATE jobs SET title = ?, company_name = ?, location = ?, salary_range = ?, skills_required = ?, experience_required = ?, description = ?
       WHERE id = ?`,
      [
        title || job.title,
        companyName || job.company_name,
        location || job.location,
        salaryRange || job.salary_range,
        skillsRequired || job.skills_required,
        experienceRequired || job.experience_required,
        description || job.description,
        id
      ]
    );

    const updatedJob = await query.get('SELECT * FROM jobs WHERE id = ?', [id]);
    res.json(updatedJob);
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({ message: 'Server error updating job listing.' });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Authorization: Must be owner or admin
    if (job.recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job.' });
    }

    await query.run('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ message: 'Job posting deleted successfully.' });
  } catch (error) {
    console.error('deleteJob error:', error);
    res.status(500).json({ message: 'Server error deleting job listing.' });
  }
};

exports.toggleJobStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'open' or 'closed'

  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const job = await query.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.recruiter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await query.run('UPDATE jobs SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Job status updated to ${status}.`, status });
  } catch (error) {
    console.error('toggleJobStatus error:', error);
    res.status(500).json({ message: 'Server error updating status.' });
  }
};
