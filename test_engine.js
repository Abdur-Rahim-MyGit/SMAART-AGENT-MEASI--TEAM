const { processCareerIntelligence } = require('./backend/engine');

const studentData = {
  personalDetails: { name: 'Priya Sharma', email: 'priya.sharma@email.com' },
  education: { degreeGroup: 'Engineering (B.Tech / B.E)', specialization: 'Computer Science' },
  skills: ['Python', 'SQL'],
  preferences: {
    primary: { role: 'Cloud Engineer' },
    secondary: { role: 'Data Analyst' },
    tertiary: { role: 'Frontend Developer' }
  }
};

processCareerIntelligence(studentData)
  .then(res => console.log('✅ Success:', JSON.stringify(res, null, 2)))
  .catch(err => console.error('❌ Error:', err.message, err.stack));
