const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smaart_db');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        if (collections.find(c => c.name === 'users')) {
            const user = await mongoose.connection.db.collection('users').findOne({});
            console.log('Sample User:', JSON.stringify(user, null, 2));
        } else {
            console.log('No users collection found.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
