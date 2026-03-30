
const axios = require('axios');
require('dotenv').config();

async function checkModels() {
  const models = [
    'claude-3-5-sonnet-latest',
    'claude-3-haiku-20240307'
  ];

  let key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    key = key.trim().replace(/^["']|["']$/g, ''); // Trim and remove leading/trailing quotes
  }

  console.log('Testing Anthropic Key (processed):', key ? 'Length: ' + key.length : 'Missing');

  for (const model of models) {
    try {
      console.log(`Testing model ${model} with key length ${key ? key.length : 0}...`);
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
