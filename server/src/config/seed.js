require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Sentence = require('../models/Sentence');
const ReadingPassage = require('../models/ReadingPassage');
const { sentences, passages } = require('./seedData');

const seedData = async () => {
  try {
    await connectDB();
    
    // Non-destructive upsert for Sentences preserving fixed _ids
    for (const sentence of sentences) {
      await Sentence.updateOne(
        { _id: sentence._id },
        { $set: sentence },
        { upsert: true }
      );
    }

    // Non-destructive upsert for ReadingPassages preserving fixed _ids
    for (const passage of passages) {
      await ReadingPassage.updateOne(
        { _id: passage._id },
        { $set: passage },
        { upsert: true }
      );
    }

    console.log('Database successfully synced with Finnish sentences and passages via non-destructive upsert!');

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
