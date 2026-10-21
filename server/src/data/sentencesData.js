const Sentence = require('../models/Sentence');
const { sentences } = require('../config/seedData');
const { isDbConnected } = require('./connection');

// List for GET /api/sentences. Falls back to seed data when the DB is not
// connected, returns nothing, or throws.
async function listSentences() {
  try {
    if (!isDbConnected()) {
      throw new Error('Database not connected');
    }
    const dbSentences = await Sentence.find().exec();
    if (Array.isArray(dbSentences) && dbSentences.length > 0) {
      return { data: dbSentences, source: 'database' };
    }
  } catch (error) {
    // fall through to the seed data
  }
  return { data: sentences, source: 'memory' };
}

// One sentence by id. No fallback on DB errors (they propagate).
async function findSentenceById(id) {
  if (!isDbConnected()) {
    return sentences.find(s => s._id.toString() === id.toString()) || null;
  }
  return Sentence.findById(id).exec();
}

// Sentences for a practice session.
//   availableSentences: what questions are made from (limited by sentenceIds)
//   distractorPool: where wrong options come from (ignores sentenceIds, so a
//   review of a few sentences still gets enough distractors)
// DB errors propagate.
async function findSessionSentences({ category, sentenceIds = [] } = {}) {
  if (!isDbConnected()) {
    let availableSentences = sentences;
    if (category) {
      availableSentences = availableSentences.filter(s => s.category === category);
    }
    const distractorPool = availableSentences;
    if (sentenceIds.length > 0) {
      const idSet = new Set(sentenceIds);
      availableSentences = availableSentences.filter(s => idSet.has(s._id.toString()));
    }
    return { availableSentences, distractorPool };
  }

  const query = {};
  if (category) {
    query.category = category;
  }
  if (sentenceIds.length > 0) {
    const availableSentences = await Sentence.find({ ...query, _id: { $in: sentenceIds } }).exec();
    const distractorPool = await Sentence.find(query).exec();
    return { availableSentences, distractorPool };
  }
  const availableSentences = await Sentence.find(query).exec();
  return { availableSentences, distractorPool: availableSentences };
}

// Every sentence, regardless of category (extra distractors). DB errors propagate.
async function findAllSentences() {
  return isDbConnected() ? Sentence.find({}).exec() : sentences;
}

module.exports = { listSentences, findSentenceById, findSessionSentences, findAllSentences };
