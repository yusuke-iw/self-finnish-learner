const mongoose = require('mongoose');
const ReadingPassage = require('../models/ReadingPassage');
const { passages } = require('../config/seedData');

exports.getPassages = async (req, res) => {
  try {
    // Without a DB connection, Mongoose buffers the query for 10 s before failing, so skip it
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    const dbPassages = await ReadingPassage.find().select('title translation category difficulty').exec();
    if (Array.isArray(dbPassages) && dbPassages.length > 0) {
      return res.json({ success: true, data: dbPassages, source: 'database' });
    }
    // Fallback to memory seed data if DB returns nothing
    const listData = passages.map(({ _id, title, translation, category, difficulty }) => ({ _id, title, translation, category, difficulty }));
    return res.json({ success: true, data: listData, source: 'memory' });
  } catch (error) {
    // On any error, fallback to memory data
    const listData = passages.map(({ _id, title, translation, category, difficulty }) => ({ _id, title, translation, category, difficulty }));
    return res.json({ success: true, data: listData, source: 'memory' });
  }
};

exports.getPassageById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    const dbPassage = await ReadingPassage.findById(req.params.id).exec();
    if (dbPassage) {
      return res.json({ success: true, data: dbPassage, source: 'database' });
    }
    // Not found in DB, try memory
    const passage = passages.find(p => p._id === req.params.id);
    if (!passage) {
      return res.status(404).json({ success: false, error: 'Reading passage not found' });
    }
    return res.json({ success: true, data: passage, source: 'memory' });
  } catch (error) {
    // On error, fallback to memory
    const passage = passages.find(p => p._id === req.params.id);
    if (!passage) {
      return res.status(404).json({ success: false, error: 'Reading passage not found' });
    }
    return res.json({ success: true, data: passage, source: 'memory' });
  }
};
