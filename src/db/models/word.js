import { model, Schema } from 'mongoose';

const wordSchema = new Schema(
  {
    en: { type: String, required: true, index: 'text' },
    ua: { type: String, required: true, index: 'text' },
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
        'idiom',
      ],
      required: true,
      index: true,
    },
    isIrregular: { type: Boolean, default: false, index: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    progress: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

wordSchema.index({ progress: 1, createdAt: -1 });
wordSchema.index({ owner: 1, progress: 1, createdAt: -1 });

export const WordCollection = model('words', wordSchema);
