const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_zXTKcoMh1aN7@ep-muddy-tree-az35sk24.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
if (!process.env.DATABASE_URL) {
  console.log("Using default fallback DATABASE_URL");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && (
    connectionString.includes('sslmode=require') || 
    connectionString.includes('neon.tech') || 
    process.env.NODE_ENV === 'production' ||
    (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'))
  ) ? { rejectUnauthorized: false } : false
});

// Helper functions to use promises and emulate SQLite-like API
const query = {
  async run(sql, params = []) {
    let idx = 1;
    let finalSql = sql.replace(/\?/g, () => `$${idx++}`);
    
    // Automatically add RETURNING id for INSERT queries if not already present
    if (finalSql.trim().toUpperCase().startsWith('INSERT') && !finalSql.toUpperCase().includes('RETURNING')) {
      finalSql += ' RETURNING id';
    }

    const res = await pool.query(finalSql, params);
    return {
      id: res.rows[0]?.id || null,
      changes: res.rowCount
    };
  },

  async get(sql, params = []) {
    let idx = 1;
    const finalSql = sql.replace(/\?/g, () => `$${idx++}`);
    const res = await pool.query(finalSql, params);
    return res.rows[0] || null;
  },

  async all(sql, params = []) {
    let idx = 1;
    const finalSql = sql.replace(/\?/g, () => `$${idx++}`);
    const res = await pool.query(finalSql, params);
    return res.rows;
  }
};

async function initDB() {
  try {
    // 1. Create Users Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Recruiters Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS recruiters (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        company_name TEXT NOT NULL,
        company_website TEXT,
        company_logo TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Create Candidates Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        phone TEXT,
        skills TEXT,
        education TEXT,
        experience TEXT,
        resume_url TEXT,
        resume_filename TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add resume_filename column if it doesn't exist (safe migration for existing DBs)
    await query.run(`
      ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_filename TEXT
    `);

    // 4. Create Jobs Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        company_name TEXT NOT NULL,
        location TEXT NOT NULL,
        salary_range TEXT,
        skills_required TEXT,
        experience_required TEXT,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 5. Create Applications Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        candidate_id INTEGER NOT NULL,
        status TEXT DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 6. Create Interviews Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL,
        scheduled_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    // 7. Create Notifications Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables initialized successfully.');
    await seedData();
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

async function seedData() {
  const userCount = await query.get('SELECT COUNT(*) as count FROM users');
  if (parseInt(userCount.count) > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  console.log('Seeding initial data...');
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('password123', salt);
  const recruiterPassword = await bcrypt.hash('password123', salt);
  const candidatePassword = await bcrypt.hash('password123', salt);

  // Insert Users
  const adminResult = await query.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin@jobportal.com', adminPassword, 'System Admin', 'admin']
  );
  
  const recruiterResult = await query.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['recruiter@jobportal.com', recruiterPassword, 'Alice Recruiter', 'recruiter']
  );
  
  const candidateResult = await query.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['candidate@jobportal.com', candidatePassword, 'John Candidate', 'candidate']
  );

  // Insert Recruiter profile
  await query.run(
    'INSERT INTO recruiters (user_id, company_name, company_website) VALUES (?, ?, ?)',
    [recruiterResult.id, 'TechCorp Solutions', 'https://techcorp.com']
  );

  // Insert Candidate profile
  const defaultEducation = JSON.stringify([
    { degree: 'B.S. in Computer Science', school: 'State University', year: '2024' }
  ]);
  const defaultExperience = JSON.stringify([
    { role: 'Software Engineer Intern', company: 'DevShop', duration: '6 months' }
  ]);

  await query.run(
    'INSERT INTO candidates (user_id, phone, skills, education, experience) VALUES (?, ?, ?, ?, ?)',
    [candidateResult.id, '+123456789', 'React, JavaScript, Node.js, CSS', defaultEducation, defaultExperience]
  );

  // Insert some sample jobs
  const job1 = await query.run(
    'INSERT INTO jobs (recruiter_id, title, company_name, location, salary_range, skills_required, experience_required, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      recruiterResult.id,
      'Frontend React Engineer',
      'TechCorp Solutions',
      'Remote (San Francisco, CA)',
      '$90,000 - $120,000',
      'React, JavaScript, Tailwind CSS',
      '2+ Years',
      'We are looking for a passionate Frontend React Engineer to build beautiful, responsive web applications. You will collaborate closely with UI designers and product managers to create stellar user experiences.'
    ]
  );

  const job2 = await query.run(
    'INSERT INTO jobs (recruiter_id, title, company_name, location, salary_range, skills_required, experience_required, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      recruiterResult.id,
      'Node.js Backend Developer',
      'TechCorp Solutions',
      'New York, NY (Hybrid)',
      '$100,000 - $130,000',
      'Node.js, Express, SQLite, SQL, JWT',
      '3+ Years',
      'TechCorp is seeking a Backend Developer proficient in Node.js and REST API design. You will be responsible for managing databases, structuring REST APIs, and implementing robust security features.'
    ]
  );

  // Insert sample applications
  const app1 = await query.run(
    'INSERT INTO applications (job_id, candidate_id, status) VALUES (?, ?, ?)',
    [job1.id, candidateResult.id, 'shortlisted']
  );

  // Seed sample interview
  await query.run(
    'INSERT INTO interviews (application_id, scheduled_time, status, notes) VALUES (?, ?, ?, ?)',
    [app1.id, '2026-07-01T10:00:00', 'scheduled', 'Initial technical assessment via video call. Please review React concepts.']
  );

  // Seed user notification
  await query.run(
    'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
    [candidateResult.id, 'Your application for Frontend React Engineer has been Shortlisted! Interview is scheduled.']
  );

  console.log('Seeding completed successfully.');
}

module.exports = {
  pool,
  query,
  initDB
};
