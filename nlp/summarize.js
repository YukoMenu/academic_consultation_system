// npm install dotenv
// npm install dotenv axios
// npm install ibm-watson@7 ibm-cloud-sdk-core
/* ----- START OF SUMMARIZE.JS ----- */
// ----- summarize.js -----
require('dotenv').config();
const axios = require('axios');

async function generateSummary(text) {
  const apiKey = process.env.HF_API_KEY;

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    {
      inputs: text,
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