const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'alumni.db');
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('Seeding local DB at', DB_PATH);

// Create tables (same as src/lib/db.ts but ensure they exist)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, role TEXT, full_name TEXT, avatar_url TEXT, created_at TEXT);
  CREATE TABLE IF NOT EXISTS student_profiles (user_id TEXT PRIMARY KEY, college TEXT, degree TEXT, department TEXT, graduation_year INTEGER, location TEXT, about TEXT, skills TEXT);
  CREATE TABLE IF NOT EXISTS alumni_profiles (user_id TEXT PRIMARY KEY, graduation_year INTEGER, degree TEXT, department TEXT, current_company TEXT, current_designation TEXT, years_of_experience INTEGER, skills TEXT, location TEXT, about TEXT, is_verified INTEGER, is_mentor INTEGER, mentorship_available INTEGER);
  CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, author_id TEXT, content TEXT, type TEXT, created_at TEXT);
  CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, posted_by TEXT, title TEXT, company TEXT, description TEXT, skills TEXT, location TEXT, job_type TEXT, experience_level TEXT, is_active INTEGER);
  CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT, description TEXT, event_date TEXT, event_time TEXT, venue TEXT, speaker TEXT, event_type TEXT, created_by TEXT);
  CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, user_id TEXT, type TEXT, description TEXT, created_at TEXT);
`);

const now = new Date().toISOString();
const hasUsers = db.prepare('SELECT count(*) as c FROM users').get().c;
if (hasUsers > 3) {
  console.log('Local DB already has', hasUsers, 'users, skipping seed');
  process.exit(0);
}

function addUser(email, role, fullName) {
  const id = crypto.randomUUID();
  db.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, role, full_name, created_at) VALUES (?,?,?,?,?,?)').run(id, email, 'hashed_demo', role, fullName, now);
  return id;
}

const demoId = addUser('student@demo.com', 'student', 'Demo Student');
db.prepare(`INSERT OR IGNORE INTO student_profiles (user_id, college, department, degree, graduation_year, skills, location, about) VALUES (?,?,?,?,?,?,?,?)`).run(demoId, 'National Institute of Technology', 'Computer Science', 'B.Tech', 2026, JSON.stringify(['React','Node.js']), 'Bangalore', 'Demo student');

const alumni = [
  ['Rahul Sharma', 'rahul.sharma@alumni.demo', 'Microsoft', 'Senior Engineer'],
  ['Neha Gupta', 'neha.gupta@alumni.demo', 'Google', 'Staff Engineer'],
  ['Vikram Singh', 'vikram.singh@alumni.demo', 'Amazon', 'Software Engineer'],
  ['Ananya Iyer', 'ananya.iyer@alumni.demo', 'Flipkart', 'Data Scientist'],
];

for (const [name, email, company, role] of alumni) {
  const id = addUser(email + '.local', 'alumni', name);
  db.prepare(`INSERT OR IGNORE INTO alumni_profiles (user_id, degree, department, graduation_year, current_company, current_designation, skills, location, about, is_verified, is_mentor) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(id, 'B.Tech', 'Computer Science', 2020, company, role, JSON.stringify(['Java','AWS']), 'Bangalore', `${role} at ${company}`, 1, 1);
  db.prepare(`INSERT OR IGNORE INTO posts (id, author_id, content, type, created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), id, `Hello from ${name} at ${company}! Happy to mentor.`, 'career', now);
}

db.prepare(`INSERT OR IGNORE INTO jobs (id, posted_by, title, company, description, skills, location, job_type) VALUES (?,?,?,?,?,?,?,?)`).run(crypto.randomUUID(), demoId, 'Software Intern', 'Microsoft', 'Join us', JSON.stringify(['Java']), 'Hyderabad', 'Internship');
db.prepare(`INSERT OR IGNORE INTO events (id, title, description, event_date, event_time, venue, speaker, event_type, created_by) VALUES (?,?,?,?,?,?,?,?,?)`).run(crypto.randomUUID(), 'Alumni Reunion', 'Annual meet', '2026-03-15', '10:00', 'Auditorium', 'Dean', 'Reunion', demoId);

const acts = [
  ['connection', 'Rahul Sharma connected with Aarav Mehta'],
  ['job', 'Neha Gupta posted a job at Google'],
  ['event', 'Tech Talk scheduled'],
];
for (const [type, desc] of acts) {
  db.prepare(`INSERT OR IGNORE INTO activities (id, user_id, type, description, created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), demoId, type, desc, now);
}

console.log('Local DB seeded. File at', DB_PATH, 'size', fs.statSync(DB_PATH).size, 'bytes');
