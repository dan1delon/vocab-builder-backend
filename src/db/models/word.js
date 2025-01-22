import { model, Schema } from 'mongoose';

const wordSchema = new Schema(
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
    owner: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const WordCollection = model('words', wordSchema);
