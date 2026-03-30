
const axios = require('axios');
require('dotenv').config();

async function checkModels() {
  const models = [
    'claude-sonnet-4-5',
    'claude-sonnet-4-6',
    'claude-opus-4',
    'claude-haiku-4'
  ];

  let key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    key = key.trim().replace(/^["']|["']$/g, ''); 
  }

  console.log('Testing Anthropic Key (processed):', key ? 'Present' : 'Missing');

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'hi' }]
        },
        {
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );
      console.log(`✅ ${model} works!`);
      break; 
    } catch (error) {
       console.error(`❌ ${model} failed:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
  }
}

checkModels();
