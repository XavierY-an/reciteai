import express from 'express';
import {
  getOrCreateStudyRecord,
  updateProgress,
  submitRecitation,
  getStudyHistory
} from '../controllers/studyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 学习记录
router.get('/history', getStudyHistory);
router.get('/:articleId', getOrCreateStudyRecord);
router.put('/:articleId/progress', updateProgress);
router.post('/:articleId/recite', submitRecitation);

export default router;
