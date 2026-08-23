require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ ok: true, service: 'alumni-network-backend', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Fallback for other resources - proxy to Supabase directly via frontend, but provide stubs
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Not implemented in standalone backend - use Next.js API or add route' }));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Frontend expected at ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
