require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Sentence = require('../models/Sentence');
const ReadingPassage = require('../models/ReadingPassage');
const { sentences, passages } = require('./seedData');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await Sentence.deleteMany({});
    await ReadingPassage.deleteMany({});
    console.log('Cleared existing database entries.');

    // Insert (strip _ids from seedData to let Mongo generate them)
    const sentencesToInsert = sentences.map(({ _id, ...rest }) => rest);
    const passagesToInsert = passages.map(({ _id, ...rest }) => rest);

    await Sentence.insertMany(sentencesToInsert);
    await ReadingPassage.insertMany(passagesToInsert);
    console.log('Database successfully seeded with Finnish sentences and passages!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
