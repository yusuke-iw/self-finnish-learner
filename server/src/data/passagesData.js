const ReadingPassage = require('../models/ReadingPassage');
const { passages } = require('../config/seedData');
const { isDbConnected } = require('./connection');

const toListItem = ({ _id, title, translation, category, difficulty }) =>
  ({ _id, title, translation, category, difficulty });

const memoryList = () => ({ data: passages.map(toListItem), source: 'memory' });

// List (without bodies). Falls back to seed data when the DB is not connected,
// returns nothing, or throws.
async function listPassages() {
  try {
    if (!isDbConnected()) {
      throw new Error('Database not connected');
    }
    const dbPassages = await ReadingPassage.find().select('title translation category difficulty').exec();
    if (Array.isArray(dbPassages) && dbPassages.length > 0) {
      return { data: dbPassages, source: 'database' };
    }
  } catch (error) {
    // fall through to the seed data
  }
  return memoryList();
}

// One passage. Looks in the DB first, then in seed data (also on DB errors).
// Returns null when neither has it.
async function findPassageById(id) {
  try {
    if (!isDbConnected()) {
      throw new Error('Database not connected');
    }
    const dbPassage = await ReadingPassage.findById(id).exec();
    if (dbPassage) {
      return { data: dbPassage, source: 'database' };
    }
  } catch (error) {
    // fall through to the seed data
  }
  const passage = passages.find(p => p._id === id);
  return passage ? { data: passage, source: 'memory' } : null;
}

module.exports = { listPassages, findPassageById };
