const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smaart_db');
    console.log(`✅ MongoDB Database Initialized: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ MongoDB Warning: Could not connect. Ensure MongoDB is running and MONGO_URI is correct.`);
    console.error(error.message);
  }
};

const careerAnalysisSchema = new mongoose.Schema({
  student_name: { type: String, required: false },
  student_email: { type: String, required: false },
  primary_role: { type: String, required: false },
  input_data: { type: mongoose.Schema.Types.Mixed, required: true },
  output_data: { type: mongoose.Schema.Types.Mixed, required: true },
  profile_hash: { type: String, index: true },
  college_code: { type: String, index: true },
  zone_primary: { type: String, enum: ['Green', 'Amber', 'Red', 'Unknown'] },
  zone_secondary: { type: String, enum: ['Green', 'Amber', 'Red', 'Unknown'] },
  zone_tertiary: { type: String, enum: ['Green', 'Amber', 'Red', 'Unknown'] },
  missing_skills: [String],
  matched_skills: [String],
  skill_coverage_pct: Number,
  path_text: String,
  future_scope_text: String,
  is_synthetic: { type: Boolean, default: false },
  student_rating: { type: Number, min: 1, max: 5 },
  consent_for_training: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const CareerAnalysisModel = mongoose.model('CareerAnalysis', careerAnalysisSchema);

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: false },
  role: { type: String, default: 'student' },
  mobile: String,
  qualification: String,
  specialization: String,
  location: String,
  status: { type: String, default: 'active' },
  lastLogin: Date,
  loginHistory: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const UserModel = mongoose.model('User', userSchema);

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // 10 minutes TTL
});

const OTPModel = mongoose.model('OTP', otpSchema);

const DegreeSchema = new mongoose.Schema({
  level: { type: String, required: true },
  domain: { type: String, required: true },
  fullName: { type: String, required: true },
  specialization: { type: String }
}, { strict: false });

const DegreeModel = mongoose.model('Degree', DegreeSchema);

module.exports = {
  connectMongoDB,
  CareerAnalysisModel,
  UserModel,
  OTPModel,
  DegreeModel
};
