import Joi from 'joi';

export const wordSchema = Joi.object({
  en: Joi.string().required(),
  ua: Joi.string().required(),
  category: Joi.string()
    .valid(
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
    )
    .required(),
  isIrregular: Joi.boolean(),
});

export const createNewWordSchema = Joi.object({
  en: Joi.string().min(1).max(100).required(),
  ua: Joi.string().min(1).max(100).required(),
  category: Joi.string()
    .valid(
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
    )
    .required(),
  isIrregular: Joi.boolean(),
});

export const editWordSchema = Joi.object({
  en: Joi.string().min(1).max(100).optional(),
  ua: Joi.string().min(1).max(100).optional(),
  category: Joi.string()
    .valid(
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
    )
    .optional(),
  isIrregular: Joi.boolean().optional(),
}).min(1);
