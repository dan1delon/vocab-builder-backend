const Word = require('../models/Word');

const getCategoriesController = (req, res) => {
  const categories = [
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
  ];
  res.status(200).json(categories);
};

const createNewWordController = async (req, res) => {
  try {
    const { en, ua, category, isIrregular } = req.body;

    if (!en || !ua || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const wordExists = await Word.findOne({ en, ua, owner: req.user.id });

    if (wordExists) {
      return res.status(409).json({ message: 'Such a word already exists' });
    }

    const word = await Word.create({
      en,
      ua,
      category,
      isIrregular: Boolean(isIrregular),
      owner: req.user.id,
    });

    res.status(201).json(word);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editWordController = async (req, res) => {
  try {
    const { id } = req.params;
    const { en, ua, category, isIrregular } = req.body;

    const word = await Word.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { en, ua, category, isIrregular },
      { new: true },
    );

    if (!word) return res.status(404).json({ message: 'Word not found' });

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllWordsController = async (req, res) => {
  try {
    const { keyword, category, isIrregular, page = 1, limit = 7 } = req.query;

    const query = {
      owner: { $ne: req.user.id },
      ...(keyword && { en: { $regex: keyword, $options: 'i' } }),
      ...(category && { category }),
      ...(isIrregular && { isIrregular: isIrregular === 'true' }),
    };

    const words = await Word.find(query, 'en ua category isIrregular')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Word.countDocuments(query);

    res.status(200).json({
      results: words,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
      perPage: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsersWordsController = async (req, res) => {
  try {
    const { keyword, category, isIrregular, page = 1, limit = 7 } = req.query;

    const query = {
      owner: req.user.id,
      ...(keyword && { en: { $regex: keyword, $options: 'i' } }),
      ...(category && { category }),
      ...(isIrregular && { isIrregular: isIrregular === 'true' }),
    };

    const words = await Word.find(query, 'en ua category isIrregular')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Word.countDocuments(query);

    res.status(200).json({
      results: words,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
      perPage: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWordController = async (req, res) => {
  try {
    const { id } = req.params;

    const word = await Word.findOneAndDelete({ _id: id, owner: req.user.id });

    if (!word) return res.status(404).json({ message: 'Word not found' });

    res.status(200).json({ message: 'This word was deleted', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Task = require('../models/Task');

const getUsersTasksController = async (req, res) => {
  try {
    const { page = 1, limit = 7 } = req.query;

    const tasks = await Task.find({ owner: req.user.id })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Task.countDocuments({ owner: req.user.id });

    res.status(200).json({
      results: tasks,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
      perPage: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategoriesController,
  createNewWordController,
  editWordController,
  getAllWordsController,
  getUsersWordsController,
  deleteWordController,
};
