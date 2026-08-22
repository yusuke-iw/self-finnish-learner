const ReadingPassage = require('../models/ReadingPassage');
const { passages } = require('../config/seedData');

exports.getPassages = async (req, res) => {
  try {
    const dbPassages = await ReadingPassage.find().select('title translation category').exec();
    if (Array.isArray(dbPassages) && dbPassages.length > 0) {
      return res.json({ success: true, data: dbPassages, source: 'database' });
    }
    // Fallback to memory seed data if DB returns nothing
    const listData = passages.map(({ _id, title, translation, category }) => ({ _id, title, translation, category }));
    return res.json({ success: true, data: listData, source: 'memory' });
  } catch (error) {
    // On any error, fallback to memory data
    const listData = passages.map(({ _id, title, translation, category }) => ({ _id, title, translation, category }));
    return res.json({ success: true, data: listData, source: 'memory' });
  }
};

exports.getPassageById = async (req, res) => {
  try {
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
