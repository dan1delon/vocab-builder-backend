import { model, Schema } from 'mongoose';

const globalWordsSchema = new Schema(
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
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { timestamps: true },
);

globalWordsSchema.index({ createdAt: -1 });
globalWordsSchema.index({ category: 1, isIrregular: 1, createdAt: -1 });

export const GlobalWordCollection = model('global-words', globalWordsSchema);
