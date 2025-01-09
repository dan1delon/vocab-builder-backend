import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { createNewWordSchema, editWordSchema } from '../validation/word.js';
import {
  addWordController,
  getUsersStatisticsController,
  postAnswersController,
  getCategoriesController,
  createNewWordController,
  editWordController,
  getAllWordsController,
  getUsersWordsController,
  deleteWordController,
  getTasksController,
} from '../controllers/words.js';

const router = Router();

router.get('/all', authenticate, ctrlWrapper(getAllWordsController));

router.get('/own', authenticate, ctrlWrapper(getUsersWordsController));

router.get('/categories', authenticate, ctrlWrapper(getCategoriesController));

router.post(
  '/create',
  authenticate,
  validateBody(createNewWordSchema),
  ctrlWrapper(createNewWordController),
);

router.post('/add/:id', authenticate, ctrlWrapper(addWordController));

router.patch(
  '/edit/:id',
  authenticate,
  validateBody(editWordSchema),
  ctrlWrapper(editWordController),
);

router.delete('/delete/:id', authenticate, ctrlWrapper(deleteWordController));

router.get('/tasks', authenticate, ctrlWrapper(getTasksController));

router.post('/answers', authenticate, ctrlWrapper(postAnswersController));

router.get(
  '/statistics',
  authenticate,
  ctrlWrapper(getUsersStatisticsController),
);

export default router;
