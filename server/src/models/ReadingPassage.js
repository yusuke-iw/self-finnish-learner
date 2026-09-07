const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true
  },
  translation: {
    type: String,
    required: true,
    trim: true
  },
  translationJa: {
    type: String,
    trim: true
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionTextJa: {
    type: String,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least 2 options are required']
  },
  optionsJa: {
    type: [String]
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  },
  explanationJa: {
    type: String,
    trim: true
  }
}, { _id: false });

const readingPassageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  title: {
    type: String,
    required: [true, 'Passage title is required'],
    trim: true
  },
  titleJa: {
    type: String,
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Passage text is required'],
    trim: true
  },
  translation: {
    type: String,
    trim: true
  },
  translationJa: {
    type: String,
    trim: true
  },
  vocabulary: [vocabularySchema],
  questions: [questionSchema],
  category: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReadingPassage', readingPassageSchema);
