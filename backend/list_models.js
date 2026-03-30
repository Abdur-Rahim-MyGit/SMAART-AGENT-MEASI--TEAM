const axios = require('axios');
require('dotenv').config();

async function listAvailableModels() {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();

  if (!key) {
    console.error('❌ ANTHROPIC_API_KEY is not set in .env');
    return;
  }

  console.log('🔑 Key prefix:', key.substring(0, 14) + '...');
  console.log('📡 Querying Anthropic for available models...\n');

  try {
    const response = await axios.get('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    const models = response.data.data || [];
    console.log(`✅ Found ${models.length} available models for your API key:\n`);
    models.forEach(m => {
      console.log(`  → ${m.id}  (display: ${m.display_name || 'N/A'})`);
    });
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

listAvailableModels();
