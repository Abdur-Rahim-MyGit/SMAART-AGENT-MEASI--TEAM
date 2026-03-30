
const axios = require('axios');
require('dotenv').config();

async function checkModels() {
  const models = [
    'claude-3-5-sonnet-latest',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ];

  console.log('Testing Anthropic Key:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing');

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
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );
      console.log(`✅ ${model} works! Response: ${response.data.content[0].text}`);
      break; 
    } catch (error) {
       console.error(`❌ ${model} failed:`, error.response ? error.response.data.error.message : error.message);
    }
  }
}

checkModels();
