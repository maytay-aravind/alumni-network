#!/usr/bin/env node
// Comprehensive seed for presentation - creates realistic demo data
// Usage: node scripts/seed-presentation.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i+1).trim()]; })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) { console.error('Missing env'); process.exit(1); }
const sb = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

const students = [
  { first: 'Aarav', last: 'Mehta', dept: 'Computer Science', year: 2026, college: 'National Institute of Technology', skills: ['React', 'Node.js', 'Python'], loc: 'Bangalore' },
  { first: 'Priya', last: 'Sharma', dept: 'Information Technology', year: 2025, college: 'National Institute of Technology', skills: ['Java', 'SQL', 'AWS'], loc: 'Hyderabad' },
  { first: 'Rohan', last: 'Patel', dept: 'Electronics & Communication', year: 2026, college: 'National Institute of Technology', skills: ['C++', 'Python', 'Machine Learning'], loc: 'Pune' },
  { first: 'Sneha', last: 'Reddy', dept: 'Computer Science', year: 2025, college: 'National Institute of Technology', skills: ['JavaScript', 'TypeScript', 'Next.js'], loc: 'Chennai' },
  { first: 'Arjun', last: 'Verma', dept: 'Mechanical Engineering', year: 2026, college: 'National Institute of Technology', skills: ['CAD', 'Python', 'Leadership'], loc: 'Delhi' },
];

const alumni = [
  { first: 'Rahul', last: 'Sharma', dept: 'Computer Science', year: 2020, company: 'Microsoft', role: 'Senior Software Engineer', exp: 5, skills: ['Java', 'Azure', 'System Design'], loc: 'Hyderabad', verified: true, mentor: true },
  { first: 'Neha', last: 'Gupta', dept: 'Computer Science', year: 2019, company: 'Google', role: 'Staff Engineer', exp: 6, skills: ['Python', 'ML', 'TensorFlow'], loc: 'Bangalore', verified: true, mentor: true },
  { first: 'Vikram', last: 'Singh', dept: 'Information Technology', year: 2021, company: 'Amazon', role: 'Software Engineer', exp: 4, skills: ['AWS', 'Node.js', 'React'], loc: 'Hyderabad', verified: true, mentor: true },
  { first: 'Ananya', last: 'Iyer', dept: 'Data Science', year: 2020, company: 'Flipkart', role: 'Data Scientist', exp: 5, skills: ['Python', 'SQL', 'ML'], loc: 'Bangalore', verified: true, mentor: true },
  { first: 'Karan', last: 'Singh', dept: 'Computer Science', year: 2018, company: 'Adobe', role: 'Principal Engineer', exp: 7, skills: ['C++', 'React', 'System Design'], loc: 'Pune', verified: true, mentor: false },
  { first: 'Pooja', last: 'Desai', dept: 'Electronics & Communication', year: 2021, company: 'Infosys', role: 'Tech Lead', exp: 4, skills: ['Java', 'Spring', 'Microservices'], loc: 'Chennai', verified: true, mentor: true },
  { first: 'Aditya', last: 'Kumar', dept: 'Computer Science', year: 2022, company: 'Swiggy', role: 'Software Engineer', exp: 3, skills: ['React', 'Node.js', 'MongoDB'], loc: 'Bangalore', verified: true, mentor: false },
  { first: 'Divya', last: 'Rao', dept: 'Business Administration', year: 2019, company: 'Goldman Sachs', role: 'Product Manager', exp: 6, skills: ['Product', 'Agile', 'SQL'], loc: 'Mumbai', verified: true, mentor: true },
  { first: 'Siddharth', last: 'Joshi', dept: 'Computer Science', year: 2023, company: 'Razorpay', role: 'Backend Engineer', exp: 2, skills: ['Go', 'PostgreSQL', 'Docker'], loc: 'Remote', verified: false, mentor: false },
  { first: 'Meera', last: 'Nair', dept: 'Information Technology', year: 2020, company: 'Microsoft', role: 'Cloud Engineer', exp: 5, skills: ['Azure', 'Kubernetes', 'Python'], loc: 'Hyderabad', verified: true, mentor: true },
];

const jobs = [
  { title: 'Software Engineer Intern', company: 'Microsoft', loc: 'Hyderabad / Remote', type: 'Internship', exp: 'Fresher', skills: ['Java', 'DSA'], desc: 'Join Microsoft as an intern. Work on Azure with senior mentors.' },
  { title: 'Frontend Developer', company: 'Google', loc: 'Bangalore', type: 'Full-time', exp: 'Entry Level', skills: ['React', 'TypeScript'], desc: 'Build next-gen UIs for Google Cloud.' },
  { title: 'Data Scientist', company: 'Flipkart', loc: 'Bangalore', type: 'Full-time', exp: 'Mid Level', skills: ['Python', 'ML'], desc: 'Own recommendations at scale.' },
  { title: 'Product Manager', company: 'Goldman Sachs', loc: 'Mumbai', type: 'Full-time', exp: 'Mid Level', skills: ['Product', 'SQL'], desc: 'Drive fintech products.' },
  { title: 'DevOps Engineer', company: 'Amazon', loc: 'Hyderabad', type: 'Full-time', exp: 'Mid Level', skills: ['AWS', 'Docker', 'Kubernetes'], desc: 'Scale infra for millions.' },
];

const events = [
  { title: 'Alumni Reunion 2026', desc: 'Annual reunion with networking and awards.', date: '2026-03-15', time: '10:00', venue: 'Main Auditorium', speaker: 'Dean & Alumni President', type: 'Reunion' },
  { title: 'Tech Talk: AI in 2026', desc: 'Neha Gupta (Google) on LLMs in production.', date: '2026-02-20', time: '14:00', venue: 'Seminar Hall', speaker: 'Neha Gupta, Google', type: 'Seminar' },
  { title: 'Career Guidance Workshop', desc: 'Resume, interviews, and referrals with Rahul Sharma.', date: '2026-02-28', time: '11:00', venue: 'Workshop Hall', speaker: 'Rahul Sharma, Microsoft', type: 'Workshop' },
  { title: 'Hackathon: Build for Alumni', desc: '24-hour hackathon. Prizes and internships.', date: '2026-03-05', time: '09:00', venue: 'Innovation Lab', speaker: 'Tech Team', type: 'Hackathon' },
];

const posts = [
  { content: 'From NIT to Microsoft — 5 years, 3 teams, countless learnings. My biggest lesson: stay curious and document everything. Happy to mentor!', type: 'career' },
  { content: 'We are hiring Frontend Interns at Google Bangalore. React + TypeScript. DM for referral. Portfolio + GitHub link required.', type: 'opportunity' },
  { content: 'Just shipped a feature to 10M users. The journey from college project to production is wild. AMA about system design!', type: 'advice' },
  { content: 'College memories: The 3am maggi at the hostel and the final year project that never compiled until the last hour. Missing it all!', type: 'general' },
  { content: 'Resume tip: Quantify impact. “Built API” → “Built REST API serving 50k req/day, reduced latency 30%”. Numbers matter.', type: 'advice' },
];

async function ensureUser(email, password, role, fullName) {
  const { data: list } = await sb.auth.admin.listUsers();
  let user = list.users.find(u => u.email === email);
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role, full_name: fullName } });
    if (error) throw error;
    user = data.user;
    console.log(`  created ${role} ${email} -> ${user.id}`);
  } else {
    console.log(`  exists ${role} ${email} -> ${user.id}`);
  }
  await sb.from('users').upsert({ id: user.id, email, role, full_name: fullName }, { onConflict: 'id' });
  return user;
}

(async () => {
  console.log('Seeding presentation data...');
  // Ensure demo accounts exist first
  await ensureUser('student@demo.com', 'demo1234', 'student', 'Demo Student');
  await ensureUser('alumni@demo.com', 'demo1234', 'alumni', 'Demo Alumni');
  await ensureUser('admin@demo.com', 'demo1234', 'admin', 'Demo Admin');

  const createdAlumni = [];
  const createdStudents = [];

  for (const s of students) {
    const email = `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.demo.local`;
    const u = await ensureUser(email, 'demo1234', 'student', `${s.first} ${s.last}`);
    createdStudents.push({ user: u, data: s });
    await sb.from('student_profiles').upsert({
      user_id: u.id, college: s.college, department: s.dept, degree: 'B.Tech',
      graduation_year: s.year, skills: s.skills, location: s.loc, about: `Aspiring ${s.dept} student, passionate about ${s.skills.join(', ')}.`
    }, { onConflict: 'user_id' });
  }

  for (const a of alumni) {
    const email = `${a.first.toLowerCase()}.${a.last.toLowerCase()}@alumni.demo.local`;
    const u = await ensureUser(email, 'demo1234', 'alumni', `${a.first} ${a.last}`);
    createdAlumni.push({ user: u, data: a });
    await sb.from('alumni_profiles').upsert({
      user_id: u.id, degree: 'B.Tech', department: a.dept, graduation_year: a.year,
      current_company: a.company, current_designation: a.role, years_of_experience: a.exp,
      skills: a.skills, location: a.loc, about: `${a.role} at ${a.company}. Love mentoring juniors.`,
      is_verified: a.verified, is_mentor: a.mentor, mentorship_available: a.mentor, badges: a.verified ? ['Verified Alumni'] : []
    }, { onConflict: 'user_id' });
  }

  // Get admin id for created_by
  const { data: adminRow } = await sb.from('users').select('id').eq('email', 'admin@demo.com').single();
  const creatorId = adminRow?.id || createdAlumni[0].user.id;

  // Jobs
  for (const j of jobs) {
    const poster = createdAlumni[Math.floor(Math.random() * createdAlumni.length)].user.id;
    await sb.from('jobs').insert({
      posted_by: poster, title: j.title, company: j.company, description: j.desc,
      skills: j.skills, location: j.loc, job_type: j.type, experience_level: j.exp, is_active: true,
      deadline: '2026-04-30'
    }).then(r => { if (r.error) console.log('job insert', r.error.message); });
  }
  console.log('  jobs seeded');

  // Events
  for (const e of events) {
    await sb.from('events').insert({
      title: e.title, description: e.desc, event_date: e.date, event_time: e.time,
      venue: e.venue, speaker: e.speaker, event_type: e.type, created_by: creatorId,
      registration_deadline: e.date, max_participants: 200
    }).then(r => { if (r.error) console.log('event insert', r.error.message); });
  }
  console.log('  events seeded');

  // Posts
  for (let i = 0; i < posts.length; i++) {
    const author = createdAlumni[i % createdAlumni.length].user.id;
    await sb.from('posts').insert({ author_id: author, content: posts[i].content, type: posts[i].type }).then(r => { if (r.error) console.log('post insert', r.error.message); });
  }
  console.log('  posts seeded');

  // Connections: connect first student to 3 alumni
  if (createdStudents.length && createdAlumni.length) {
    const sId = createdStudents[0].user.id;
    for (let i = 0; i < 3; i++) {
      await sb.from('connections').upsert({ sender_id: sId, receiver_id: createdAlumni[i].user.id, status: i === 0 ? 'accepted' : 'pending' }, { onConflict: 'sender_id,receiver_id' }).then(r => { if (r.error) console.log('connection', r.error.message); });
    }
    console.log('  connections seeded');
  }

  console.log('Done. Demo data ready for presentation.');
  console.log('Try: student@demo.com / alumni@demo.com / admin@demo.com with demo1234');
  console.log('Plus: ' + students.map(s => s.first.toLowerCase()+'.'+s.last.toLowerCase()+'@student.demo.local').join(', '));
})();
