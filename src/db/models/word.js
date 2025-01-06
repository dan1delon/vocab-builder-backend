const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  en: { type: String, required: true },
  ua: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'verb',
      'participle',
      'noun',
      'adjective',
      'pronoun',
      'numerals',
      'adverb',
      'preposition',
      'conjunction',
      'phrasal verb',
      'functional phrase',
    ],
    required: true,
  },
  isIrregular: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0 },
});

module.exports = mongoose.model('Word', wordSchema);
