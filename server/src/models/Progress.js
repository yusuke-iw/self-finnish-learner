const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default_user',
    unique: true,
    index: true
  },
  learningPath: {
    type: Map,
    of: Number,
    default: {}
  },
  passagesProgress: {
    type: Map,
    of: Boolean,
    default: {}
  },
  passageAnswers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mistakes: {
    type: Array,
    default: []
  },
  settings: {
    language: {
      type: String,
      default: 'ja'
    }
  }
}, {
  timestamps: true,
  // Ensure Map fields are serialized properly to JSON objects
  toJSON: {
    transform: (doc, ret) => {
      if (ret.learningPath instanceof Map) {
        ret.learningPath = Object.fromEntries(ret.learningPath);
      }
      if (ret.passagesProgress instanceof Map) {
        ret.passagesProgress = Object.fromEntries(ret.passagesProgress);
      }
      if (ret.passageAnswers instanceof Map) {
        ret.passageAnswers = Object.fromEntries(ret.passageAnswers);
      }
      return ret;
    }
  }
});

module.exports = mongoose.model('Progress', progressSchema);
