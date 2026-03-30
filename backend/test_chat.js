
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

console.log('ANTHROPIC_API_KEY is defined:', !!process.env.ANTHROPIC_API_KEY);

async function testChat() {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/claude-chat', {
      message: 'Hello'
    });
    console.log('Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

testChat();
