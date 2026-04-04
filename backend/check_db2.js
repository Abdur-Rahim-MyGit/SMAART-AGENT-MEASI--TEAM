require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongoDB, DegreeModel } = require('./mongoDb');

(async () => {
  await connectMongoDB();
  const count = await DegreeModel.countDocuments();
  console.log("Total docs:", count);
  const docs = await DegreeModel.find({}).limit(1).lean();
  if (docs.length) {
    console.log("Sample:", JSON.stringify(docs[0], null, 2));
  }
  process.exit(0);
})();
