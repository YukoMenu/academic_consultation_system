// npm install dotenv
// npm install dotenv axios
// npm install ibm-watson@7 ibm-cloud-sdk-core
//
// inside .env file:
// HF_API_KEY=your_huggingface_api_key_here

/* ----- START OF SUMMARIZE.JS ----- */
require('dotenv').config();
const axios = require('axios');

async function generateSummary(text) {
  const apiKey = process.env.HF_API_KEY;
  const prompt = `Summarize the following consultation report focusing on key interventions, outcomes, and student progress.
  Here is an example of a summary taken from one of the existing data:
  "Most of the issues during the prefinal period were missed activities/quizzes due
  to absccenes. In addition, being absent or late in the class resulted in some
  difficulties in understanding some lessons.
  
  During the consultation hours, I discussed again portions of the lessons that is not
  yet fully understood. I encouraged them to motivate themselves and asked them
  to track their own progress."

  Actually use the data you have obtained, what was said above was just a sample.
  :\n\n${text}`;

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