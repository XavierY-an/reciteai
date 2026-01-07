import express from 'express';
import {
  getOrCreateStudyRecord,
  updateProgress,
  submitRecitation,
  getStudyHistory
  lookupWord
} from '../controllers/studyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 学习记录
router.get('/history', getStudyHistory);
router.get('/:articleId', getOrCreateStudyRecord);
router.put('/:articleId/progress', updateProgress);
n// 单词查询（不需要articleId）
router.post('/lookup-word', lookupWord);
router.post('/:articleId/recite', submitRecitation);

export default router;
