import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { createNewWordSchema, editWordSchema } from '../validation/words.js';
import {
  getAllWordsController,
  getUsersWordsController,
  createNewWordController,
  editWordController,
  deleteWordController,
  getUsersStatisticsController,
  getUsersTasksController,
  postAnswersController,
} from '../controllers/words.js';

const router = Router();

router.get('/', ctrlWrapper(getAllWordsController));

router.get('/user', authenticate, ctrlWrapper(getUsersWordsController));

router.post(
  '/',
  authenticate,
  validateBody(createNewWordSchema),
  ctrlWrapper(createNewWordController),
);

router.patch(
  '/:id',
  authenticate,
  validateBody(editWordSchema),
  ctrlWrapper(editWordController),
);

router.delete('/:id', authenticate, ctrlWrapper(deleteWordController));

router.get(
  '/statistics',
  authenticate,
  ctrlWrapper(getUsersStatisticsController),
);

router.get('/tasks', authenticate, ctrlWrapper(getUsersTasksController));

router.post('/answers', authenticate, ctrlWrapper(postAnswersController));

export default router;
