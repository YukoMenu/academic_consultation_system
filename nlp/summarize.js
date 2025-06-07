/* ----- START OF SUMMARIZE.JS ----- */
require('dotenv').config();
const axios = require('axios');

async function generateSummary(text) {
  const apiKey = process.env.HF_API_KEY;
  const prompt = `${text}`;

  const response = await axios.post(  
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    {
      inputs: prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data[0]?.summary_text || 'No summary generated.';
}

module.exports = { generateSummary };
/* ----- END OF SUMMARIZE.JS ----- */