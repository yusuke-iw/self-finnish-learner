const mongoose = require('mongoose');

const sentenceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Finnish text is required'],
    trim: true
  },
  translation: {
    type: String,
    required: [true, 'Translation is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  audioUrl: {
    type: String
  },
  grammarNotes: {
    type: String
  },
  category: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sentence', sentenceSchema);
