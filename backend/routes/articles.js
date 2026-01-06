import express from 'express';
import {
  createArticle,
  getArticles,
  getArticleById,
  deleteArticle,
  ocrImage
} from '../controllers/articleController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// OCR 识别
router.post('/ocr', ocrImage);

// 文章 CRUD
router.post('/', createArticle);
router.get('/', getArticles);
router.get('/:id', getArticleById);
router.delete('/:id', deleteArticle);

export default router;
