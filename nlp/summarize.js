// npm install dotenv
// npm install dotenv axios
/* ----- START OF SUMMARIZE.JS ----- */
require('dotenv').config();
const axios = require('axios');

async function generateSummary(text) {
  const apiKey = process.env.OPENAI_API_KEY;

  const prompt = `Summarize the following text in 3–4 concise bullet points:\n\n${text}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { generateSummary };
/* ----- END OF SUMMARIZE.JS ----- */