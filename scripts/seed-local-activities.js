const { getDb } = require('../src/lib/db.ts');
const crypto = require('crypto');

// This will be run via node with ts-node or compiled
// For now, create a simple JS version that uses better-sqlite3 directly
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'alumni.db');
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const activities = [
  { type: 'connection', description: 'Rahul Sharma connected with Aarav Mehta' },
  { type: 'job', description: 'Neha Gupta posted Software Engineer at Google' },
  { type: 'event', description: 'Tech Talk: AI in 2026 scheduled for Feb 20' },
  { type: 'post', description: 'Vikram Singh shared a career update' },
  { type: 'mentorship', description: 'Ananya Iyer accepted mentorship request from Priya Sharma' },
  { type: 'achievement', description: 'Karan Singh earned Verified Alumni badge' },
  { type: 'job', description: 'Pooja Desai posted Data Scientist at Flipkart' },
  { type: 'event', description: 'Hackathon: Build for Alumni announced' },
];

const users = db.prepare('SELECT id FROM users LIMIT 1').get();
const userId = users?.id || 'demo-user';

for (const a of activities) {
  const id = crypto.randomUUID();
  db.prepare('INSERT OR IGNORE INTO activities (id, user_id, type, description, created_at) VALUES (?, ?, ?, ?, datetime("now", ?))').run(
    id, userId, a.type, a.description, `-${Math.floor(Math.random()*5)} days`
  );
}

console.log('Activities seeded');
