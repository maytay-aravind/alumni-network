const express = require('express');
const { askGemini } = require('../lib/gemini');
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });
    const prompt = `You are AlumniAI, a helpful career assistant for college students. Context: ${JSON.stringify(context || {})}\nStudent: ${message}\nRespond helpfully with clear, actionable advice.`;
    const text = await askGemini(prompt);
    res.json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/skill-gap', async (req, res) => {
  try {
    const { current_skills, target_career } = req.body;
    if (!target_career) return res.status(400).json({ error: 'Missing target_career' });
    const prompt = `Analyze skill gap. Current: ${(current_skills||[]).join(', ')}. Target: ${target_career}. Return JSON with {match_percentage:number, missing_skills:string[], roadmap:string[]}`;
    const text = await askGemini(prompt);
    res.json({ raw: text });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/resume', async (req, res) => {
  try {
    const { resume_text } = req.body;
    if (!resume_text) return res.status(400).json({ error: 'Missing resume_text' });
    const prompt = `Analyze this resume and return JSON {score:number, strengths:string[], missing_skills:string[], suggestions:string[]}. Resume: ${resume_text.slice(0,4000)}`;
    const text = await askGemini(prompt);
    res.json({ raw: text });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
