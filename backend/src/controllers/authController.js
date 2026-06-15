const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

exports.register = async (req, res) => {
  const { email, password, name, role, companyName } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  if (!['candidate', 'recruiter'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Choose candidate or recruiter.' });
  }

  if (role === 'recruiter' && !companyName) {
    return res.status(400).json({ message: 'Company name is required for recruiters.' });
  }

  try {
    // Check if user already exists
    const existingUser = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await query.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    const userId = userResult.id;

    // Create role-specific profile records
    if (role === 'candidate') {
      await query.run(
        'INSERT INTO candidates (user_id, phone, skills, education, experience) VALUES (?, ?, ?, ?, ?)',
        [userId, '', '', '[]', '[]']
      );
    } else if (role === 'recruiter') {
      await query.run(
        'INSERT INTO recruiters (user_id, company_name, company_website) VALUES (?, ?, ?)',
        [userId, companyName, '']
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, name, role },
      process.env.JWT_SECRET || 'super_secret_job_portal_key_123456',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: userId, email, name, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    // Find user
    const user = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'super_secret_job_portal_key_123456',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await query.get('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'candidate') {
      profile = await query.get('SELECT * FROM candidates WHERE user_id = ?', [user.id]);
      if (profile) {
        try { profile.education = JSON.parse(profile.education || '[]'); } catch(e) { profile.education = []; }
        try { profile.experience = JSON.parse(profile.experience || '[]'); } catch(e) { profile.experience = []; }
      }
    } else if (user.role === 'recruiter') {
      profile = await query.get('SELECT * FROM recruiters WHERE user_id = ?', [user.id]);
    }

    res.json({
      ...user,
      profile
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error fetching user details.' });
  }
};
