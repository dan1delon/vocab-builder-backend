import { Router } from 'express';
import authRouter from './auth.js';
import wordsRouter from './words.js';

const router = Router();

router.use('/users', authRouter);
router.use('/words', wordsRouter);

export default router;
