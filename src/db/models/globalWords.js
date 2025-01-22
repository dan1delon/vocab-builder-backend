import { model, Schema } from 'mongoose';

const globalWordsSchema = new Schema(
  {
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
        'idiom',
      ],
      required: true,
    },
    isIrregular: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { timestamps: true },
);

export const GlobalWordCollection = model('global-words', globalWordsSchema);
