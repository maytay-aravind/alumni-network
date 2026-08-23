#!/usr/bin/env node
// Run AFTER applying supabase/patch_fix_auth.sql
// Usage: node scripts/seed-demo.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let env = {};
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(l => {
    const i = l.indexOf('=');
    if (i > -1) env[l.slice(0,i).trim()] = l.slice(i+1).trim();
  });
} catch {}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) { console.error('Missing env in .env.local'); process.exit(1); }

const demos = [
  { email: 'student@demo.com', password: 'demo1234', role: 'student', first_name: 'Demo', last_name: 'Student', college: 'Demo College', department: 'Computer Science', degree: 'B.Tech', graduation_year: 2026 },
  { email: 'alumni@demo.com', password: 'demo1234', role: 'alumni', first_name: 'Demo', last_name: 'Alumni', department: 'Computer Science', degree: 'B.Tech', graduation_year: 2020, current_company: 'Tech Corp', current_designation: 'Senior Engineer' },
  { email: 'admin@demo.com', password: 'demo1234', role: 'admin', first_name: 'Demo', last_name: 'Admin' },
];

(async () => {
  for (const d of demos) {
    const sb = createClient(url, anon);
    console.log(`\nCreating ${d.role}: ${d.email} ...`);
    const { data, error } = await sb.auth.signUp({
      email: d.email, password: d.password,
      options: { data: { role: d.role, first_name: d.first_name, last_name: d.last_name, full_name: `${d.first_name} ${d.last_name}` } }
    });
    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`  → Already exists, trying signIn to verify...`);
        const { error: e2 } = await sb.auth.signInWithPassword({ email: d.email, password: d.password });
        console.log(e2 ? `  ✗ SignIn failed: ${e2.message}` : `  ✓ SignIn works`);
      } else console.log(`  ✗ SignUp failed: ${error.message}`);
      continue;
    }
    const user = data.user;
    console.log(`  ✓ Auth user created: ${user.id}`);
    // Wait for trigger
    await new Promise(r => setTimeout(r, 1200));
    // Ensure public.users exists
    const { error: e3 } = await sb.from('users').select('id').eq('id', user.id).single();
    if (e3) {
      console.log(`  → public.users missing, inserting...`);
      const { error: e4 } = await sb.from('users').insert({ id: user.id, email: d.email, role: d.role, full_name: `${d.first_name} ${d.last_name}` });
      console.log(e4 ? `  ✗ users insert: ${e4.message}` : `  ✓ users row created`);
    } else console.log(`  ✓ public.users exists`);
    // Create profile
    if (d.role === 'student') {
      const { error: e5 } = await sb.from('student_profiles').insert({
        user_id: user.id, college: d.college, department: d.department, degree: d.degree,
        graduation_year: d.graduation_year, skills: ['JavaScript','React'], location: 'Bangalore', about: 'Demo student'
      });
      console.log(e5 ? `  ✗ student_profiles: ${e5.message}` : `  ✓ student_profiles created`);
    } else if (d.role === 'alumni') {
      const { error: e5 } = await sb.from('alumni_profiles').insert({
        user_id: user.id, degree: d.degree, department: d.department, graduation_year: d.graduation_year,
        current_company: d.current_company, current_designation: d.current_designation, skills: ['Java','Leadership'], location: 'Bangalore', about: 'Demo alumni', is_verified: true
      });
      console.log(e5 ? `  ✗ alumni_profiles: ${e5.message}` : `  ✓ alumni_profiles created`);
    }
    await sb.auth.signOut();
  }
  console.log('\nDone. Try logging in with demo credentials.');
})();
