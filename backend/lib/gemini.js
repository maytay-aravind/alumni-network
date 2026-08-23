const { GoogleGenerativeAI } = require('@google/generative-ai');

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

async function askGemini(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { getModel, askGemini };
