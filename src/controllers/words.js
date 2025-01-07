import { WordCollection } from '../db/models/word.js';
import { GlobalWordCollection } from '../db/models/globalWords.js';
import { TasksCollection } from '../db/models/task.js';
import { AnswerCollection } from '../db/models/answer.js';

export const getCategoriesController = (req, res) => {
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

export const createNewWordController = async (req, res) => {
  try {
    const { en, ua, category, isIrregular } = req.body;

    if (!en || !ua || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const wordExists = await WordCollection.findOne({
      en,
      ua,
      owner: req.user.id,
    });

    if (wordExists) {
      return res.status(409).json({ message: 'Such a word already exists' });
    }

    const globalWordExists = await GlobalWordCollection.findOne({ en, ua });
    if (!globalWordExists) {
      await GlobalWordCollection.create({
        en,
        ua,
        category,
        isIrregular: Boolean(isIrregular),
        createdBy: req.user.id,
      });
    }

    const word = await WordCollection.create({
      en,
      ua,
      category,
      isIrregular: Boolean(isIrregular),
      owner: req.user.id,
    });

    const tasks = [
      { wordId: word._id, taskType: 'en', owner: req.user.id },
      { wordId: word._id, taskType: 'ua', owner: req.user.id },
    ];

    await TasksCollection.insertMany(tasks);

    res.status(201).json(word);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editWordController = async (req, res) => {
  try {
    const { id } = req.params;
    const { en, ua, category, isIrregular } = req.body;

    const word = await WordCollection.findOneAndUpdate(
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

export const getAllWordsController = async (req, res) => {
  try {
    const { keyword, category, isIrregular, page = 1, limit = 7 } = req.query;

    const query = {
      ...(keyword && { en: { $regex: keyword, $options: 'i' } }),
      ...(category && { category }),
      ...(isIrregular && { isIrregular: isIrregular === 'true' }),
    };

    const words = await GlobalWordCollection.find(
      query,
      'en ua category isIrregular',
    )
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await GlobalWordCollection.countDocuments(query);

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

export const getUsersWordsController = async (req, res) => {
  try {
    const { keyword, category, isIrregular, page = 1, limit = 7 } = req.query;

    const query = {
      owner: req.user.id,
      ...(keyword && { en: { $regex: keyword, $options: 'i' } }),
      ...(category && { category }),
      ...(isIrregular && { isIrregular: isIrregular === 'true' }),
    };

    const words = await WordCollection.find(query, 'en ua category isIrregular')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await WordCollection.countDocuments(query);

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

export const deleteWordController = async (req, res) => {
  try {
    const { id } = req.params;

    const word = await WordCollection.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });

    if (!word) return res.status(404).json({ message: 'Word not found' });

    await TasksCollection.deleteMany({ wordId: word._id });

    const isWordUsed = await WordCollection.findOne({
      en: word.en,
      ua: word.ua,
    });
    if (!isWordUsed) {
      await GlobalWordCollection.findOneAndDelete({ en: word.en, ua: word.ua });
    }

    res.status(200).json({ message: 'This word was deleted', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWordController = async (req, res) => {
  try {
    const { id } = req.params;

    const word = await GlobalWordCollection.findById(id);

    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }

    const wordExists = await WordCollection.findOne({
      en: word.en,
      ua: word.ua,
      owner: req.user.id,
    });

    if (wordExists) {
      return res.status(409).json({ message: 'Such a word already exists' });
    }

    const newWord = await WordCollection.create({
      en: word.en,
      ua: word.ua,
      category: word.category,
      isIrregular: word.isIrregular,
      owner: req.user.id,
    });

    const tasks = [
      {
        wordId: newWord._id,
        taskType: 'en',
        owner: req.user.id,
      },
      {
        wordId: newWord._id,
        taskType: 'ua',
        owner: req.user.id,
      },
    ];

    await TasksCollection.insertMany(tasks);

    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersStatisticsController = async (req, res) => {
  try {
    const totalWords = await WordCollection.countDocuments({
      owner: req.user.id,
    });
    const totalTasks = await TasksCollection.countDocuments({
      owner: req.user.id,
    });
    const completedTasks = await TasksCollection.countDocuments({
      owner: req.user.id,
      isCompleted: true,
    });

    res.status(200).json({
      totalWords,
      totalTasks,
      completedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksController = async (req, res) => {
  try {
    const tasks = await TasksCollection.find({
      owner: req.user.id,
      isCompleted: false,
    })
      .populate({ path: 'wordId', select: 'ua' })
      .select('wordId taskType');

    const result = tasks.map((task) => ({
      _id: task._id,
      ua: task.wordId.ua,
      task: task.taskType,
    }));

    res.status(200).json({ words: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postAnswersController = async (req, res) => {
  try {
    const { taskId, answers } = req.body;

    if (!taskId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const userAnswers = answers.map((answer) => {
      if (!answer._id || !answer.task) {
        throw new Error('Invalid answer format');
      }

      return {
        wordId: answer._id,
        taskType: answer.task,
        owner: req.user.id,
      };
    });

    await AnswerCollection.insertMany(userAnswers);

    const task = await TasksCollection.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isCompleted = true;
    await task.save();

    res.status(201).json({ message: 'Answers saved and task completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
