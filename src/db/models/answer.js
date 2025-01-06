const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
  task: { type: String, enum: ['en', 'ua'], required: true },
  isDone: { type: Boolean, required: true },
});

module.exports = mongoose.model('answers', answerSchema);
