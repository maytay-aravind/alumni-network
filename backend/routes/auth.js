const express = require('express');
const { getAdminClient } = require('../lib/supabase');
const router = express.Router();

// POST /api/auth/register  { email, password, first_name, last_name, role, college, department, degree, graduation_year, skills, location, about }
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, college, department, degree, graduation_year, skills, location, about } = req.body;
    if (!email || !password || !first_name || !last_name || !role) return res.status(400).json({ error: 'Missing required fields' });
    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { role, first_name, last_name, full_name: `${first_name} ${last_name}` }
    });
    if (error) return res.status(400).json({ error: error.message });
    const userId = data.user.id;
    await supabase.from('users').upsert({ id: userId, email, role, full_name: `${first_name} ${last_name}` }, { onConflict: 'id' });
    if (role === 'student') {
      const { error: e2 } = await supabase.from('student_profiles').upsert({
        user_id: userId, college: college || '', department: department || '', degree: degree || '',
        graduation_year: parseInt(graduation_year) || new Date().getFullYear(),
        skills: skills || [], location: location || '', about: about || ''
      }, { onConflict: 'user_id' });
      if (e2) return res.status(500).json({ error: e2.message });
    } else if (role === 'alumni') {
      const { error: e2 } = await supabase.from('alumni_profiles').upsert({
        user_id: userId, degree: degree || '', department: department || '', graduation_year: parseInt(graduation_year) || 2020,
        skills: skills || [], location: location || '', about: about || '', current_company: '', current_designation: ''
      }, { onConflict: 'user_id' });
      if (e2) return res.status(500).json({ error: e2.message });
    }
    res.json({ success: true, userId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
