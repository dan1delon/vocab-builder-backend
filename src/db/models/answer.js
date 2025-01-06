import { model, Schema } from 'mongoose';

const answerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wordId: { type: Schema.Types.ObjectId, ref: 'Word', required: true },
  task: { type: String, enum: ['en', 'ua'], required: true },
  isDone: { type: Boolean, required: true },
});

export const AnswerCollection = model('answers', answerSchema);
