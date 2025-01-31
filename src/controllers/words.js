import { WordCollection } from '../db/models/word.js';
import { GlobalWordCollection } from '../db/models/globalWords.js';
import { TasksCollection } from '../db/models/task.js';

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

    await TasksCollection.insertMany([
      {
        wordId: word._id,
        task: 'ua',
        owner: req.user.id,
      },
      {
        wordId: word._id,
        task: 'en',
        owner: req.user.id,
      },
    ]);

    res.status(201).json({
      _id: word._id,
      en: word.en,
      ua: word.ua,
      category: word.category,
      isIrregular: word.isIrregular,
      owner: word.owner,
      progress: 0,
    });
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
      { en, ua, category, isIrregular, progress: 0 },
      { new: true },
    );

    if (!word) return res.status(404).json({ message: 'Word not found' });

    await TasksCollection.updateMany(
      { wordId: word._id },
      { $set: { wordId: word._id, owner: req.user.id } },
    );

    if (!(await TasksCollection.exists({ wordId: word._id, task: 'ua' }))) {
      await TasksCollection.create({
        wordId: word._id,
        task: 'ua',
        owner: req.user.id,
      });
    }

    if (!(await TasksCollection.exists({ wordId: word._id, task: 'en' }))) {
      await TasksCollection.create({
        wordId: word._id,
        task: 'en',
        owner: req.user.id,
      });
    }

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllWordsController = async (req, res) => {
  try {
    const { keyword, category, isIrregular, page = 1, limit = 7 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const query = {
      ...(keyword && {
        $or: [
          { en: { $regex: keyword, $options: 'i' } },
          { ua: { $regex: keyword, $options: 'i' } },
        ],
      }),
      ...(category && category !== 'All' && { category }),
      ...(isIrregular && { isIrregular: isIrregular === 'true' }),
    };

    const [words, total] = await Promise.all([
      GlobalWordCollection.find(query, 'en ua category isIrregular')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      GlobalWordCollection.countDocuments(query),
    ]);

    res.status(200).json({
      results: words,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      perPage: limitNum,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersWordsController = async (req, res) => {
  try {
    const { keyword, category, isIrregular, page = 1, limit = 7 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const query = {
      owner: req.user.id,
      ...(keyword && {
        $or: [
          { en: { $regex: keyword, $options: 'i' } },
          { ua: { $regex: keyword, $options: 'i' } },
        ],
      }),
      ...(category && category !== 'All' && { category }),
      ...(isIrregular && { isIrregular: isIrregular === 'true' }),
    };

    const [words, total] = await Promise.all([
      WordCollection.find(query, 'en ua category isIrregular progress')
        .sort({ progress: 1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      WordCollection.countDocuments(query),
    ]);

    res.status(200).json({
      results: words,
      totalPages: Math.ceil(total / limitNum),
      page: pageNum,
      perPage: limitNum,
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

    if (!id) {
      return res.status(400).json({ message: 'Word ID is required' });
    }

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
      progress: 0,
    });

    await TasksCollection.insertMany([
      {
        wordId: newWord._id,
        task: 'ua',
        owner: req.user.id,
      },
      {
        wordId: newWord._id,
        task: 'en',
        owner: req.user.id,
      },
    ]);

    res.status(201).json({
      word: {
        _id: newWord._id,
        en: newWord.en,
        ua: newWord.ua,
        category: newWord.category,
        isIrregular: newWord.isIrregular,
        owner: newWord.owner,
        progress: newWord.progress,
      },
    });
  } catch (error) {
    console.error('Error in addWordController:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getUsersStatisticsController = async (req, res) => {
  try {
    const incompleteTasks = await WordCollection.countDocuments({
      owner: req.user.id,
      progress: { $lt: 100 },
    });

    res.status(200).json({
      totalCount: incompleteTasks || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksController = async (req, res) => {
  try {
    const userId = req.user.id;

    await TasksCollection.deleteMany({ owner: userId, wordId: null });

    const tasks = await TasksCollection.find({
      owner: userId,
      isCompleted: false,
    })
      .populate({ path: 'wordId', select: 'en ua' })
      .select('wordId task')
      .exec();

    if (!tasks || tasks.length === 0) {
      return res.status(200).json([]);
    }

    const taskMap = new Map();

    tasks.forEach((task) => {
      if (!task.wordId) {
        console.warn('Task without wordId:', task);
        return;
      }

      const { en, ua } = task.wordId;

      if (!taskMap.has(task.wordId.toString())) {
        taskMap.set(task.wordId.toString(), { en, ua, tasks: [] });
      }

      const taskData = taskMap.get(task.wordId.toString());
      taskData.tasks.push({
        _id: task._id,
        task: task.task,
        ...(task.task === 'en' ? { ua } : { en }),
      });
    });

    const result = Array.from(taskMap.values()).flatMap(
      (taskData) => taskData.tasks,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getTasksController:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const postAnswersController = async (req, res) => {
  try {
    const answers = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const taskIds = answers.map((answer) => answer._id).filter(Boolean);

    const tasks = await TasksCollection.find({
      _id: { $in: taskIds },
    }).populate({
      path: 'wordId',
      select: 'en ua progress',
    });

    const taskMap = new Map(tasks.map((task) => [task._id.toString(), task]));

    const results = [];
    const bulkUpdateOps = [];

    await Promise.all(
      answers.map(async (answer) => {
        const { _id, ua, en, task } = answer;

        if (!_id || !task || !(ua || en)) {
          results.push({
            _id,
            ua,
            en,
            task,
            userAnswer: task === 'en' ? en : ua,
            isDone: false,
          });
          return;
        }

        const taskDoc = taskMap.get(_id);

        if (!taskDoc || !taskDoc.wordId) {
          results.push({
            _id,
            ua,
            en,
            task,
            userAnswer: task === 'en' ? en : ua,
            isDone: false,
          });
          return;
        }

        const word = taskDoc.wordId;

        const normalizeApostrophes = (str) =>
          str.replace(/[`'’]/g, "'").trim().toLowerCase();

        const normalizedUserAnswer =
          task === 'en' ? normalizeApostrophes(en) : normalizeApostrophes(ua);
        const normalizedCorrectAnswer =
          task === 'en'
            ? normalizeApostrophes(word.en)
            : normalizeApostrophes(word.ua);

        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

        let newProgress = word.progress;

        if (isCorrect) {
          newProgress = Math.min(word.progress + 50, 100);

          bulkUpdateOps.push({
            updateOne: {
              filter: { _id: word._id },
              update: { $set: { progress: newProgress } },
            },
          });

          bulkUpdateOps.push({
            deleteOne: {
              filter: { _id: taskDoc._id },
            },
          });
        } else {
          bulkUpdateOps.push({
            updateOne: {
              filter: { _id: taskDoc._id },
              update: { $set: { isCompleted: false } },
            },
          });
        }

        results.push({
          _id,
          ua: word.ua,
          en: word.en,
          task,
          userAnswer: task === 'en' ? en : ua,
          isDone: isCorrect,
        });
      }),
    );

    if (bulkUpdateOps.length > 0) {
      await WordCollection.bulkWrite(bulkUpdateOps);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in postAnswersController:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
