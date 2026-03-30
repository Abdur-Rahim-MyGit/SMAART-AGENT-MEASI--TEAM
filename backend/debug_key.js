
require('dotenv').config();
const key = process.env.ANTHROPIC_API_KEY || '';
console.log('Key Prefix [0-10]:', key.substring(0, 10));
console.log('Key Suffix [last 5]:', key.substring(key.length - 5));
console.log('Key Length:', key.length);
