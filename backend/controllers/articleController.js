import Article from '../models/Article.js';
import StudyRecord from '../models/StudyRecord.js';
import zhipuService from '../services/zhipuService.js';

// 创建文章
export const createArticle = async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 分析文本难度
    const difficulty = await zhipuService.analyzeDifficulty(content);

    // 智能拆分文本
    const sections = await zhipuService.segmentText(content, difficulty);

    // 计算字数
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    // 创建文章
    const article = await Article.create({
      userId: req.user._id,
      title: title || `文章 #${Date.now()}`,
      content,
      difficulty,
      wordCount,
      sections
    });

    res.status(201).json({
      message: '创建成功',
      article
    });
  } catch (error) {
    console.error('创建文章错误:', error);
    res.status(500).json({ error: '创建失败，请重试' });
  }
};

// 获取用户的所有文章
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ articles });
  } catch (error) {
    console.error('获取文章列表错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
};

// 获取单个文章详情
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json({ article });
  } catch (error) {
    console.error('获取文章详情错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
};

// 删除文章
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 同时删除相关的学习记录
    await StudyRecord.deleteMany({ articleId: article._id });

    await Article.deleteOne({ _id: article._id });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
};

// OCR 图片识别
export const ocrImage = async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: '请提供图片' });
    }

    const text = await zhipuService.extractTextFromImage(image, mimeType);

    res.json({
      text,
      message: '识别成功'
    });
  } catch (error) {
    console.error('OCR 错误:', error);
    res.status(500).json({ error: '识别失败，请重试' });
  }
};
