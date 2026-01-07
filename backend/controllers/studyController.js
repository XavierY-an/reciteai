import StudyRecord from '../models/StudyRecord.js';
import Article from '../models/Article.js';
import zhipuService from '../services/zhipuService.js';

// 获取或创建学习记录
export const getOrCreateStudyRecord = async (req, res) => {
  try {
    const { articleId } = req.params;

    // 查找现有记录
    let record = await StudyRecord.findOne({
      userId: req.user._id,
      articleId
    });

    // 如果不存在，创建新记录
    if (!record) {
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ error: '文章不存在' });
      }

      record = await StudyRecord.create({
        userId: req.user._id,
        articleId,
        currentSection: 0,
        completedSections: [],
        progress: 0
      });
    }

    res.json({ record });
  } catch (error) {
    console.error('获取学习记录错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
};

// 更新学习进度
export const updateProgress = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { currentSection, completedSections } = req.body;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const totalSections = article.sections.length;
    const progress = Math.round((completedSections.length / totalSections) * 100);

    const record = await StudyRecord.findOneAndUpdate(
      { userId: req.user._id, articleId },
      {
        currentSection,
        completedSections,
        progress,
        lastStudiedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: '更新成功',
      record
    });
  } catch (error) {
    console.error('更新进度错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
};

// 提交背诵结果
export const submitRecitation = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { recitedText } = req.body;

    if (!recitedText) {
      return res.status(400).json({ error: '请提供背诵内容' });
    }

    // 获取文章
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // AI 评估
    const evaluation = await zhipuService.evaluateRecitation(
      article.content,
      recitedText
    );

    // 添加到学习记录
    const record = await StudyRecord.findOneAndUpdate(
      { userId: req.user._id, articleId },
      {
        $push: {
          reciteHistory: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            detailedAnalysis: evaluation.detailedAnalysis,
            timestamp: new Date()
          }
        },
        lastStudiedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: '评估完成',
      evaluation,
      record
    });
  } catch (error) {
    console.error('提交背诵错误:', error);
    res.status(500).json({ error: '提交失败' });
  }
};

// 获取学习历史列表
export const getStudyHistory = async (req, res) => {
  try {
    const records = await StudyRecord.find({ userId: req.user._id })
      .populate('articleId', 'title difficulty wordCount createdAt')
      .sort({ lastStudiedAt: -1 })
      .lean();

    res.json({ records });
  } catch (error) {
    console.error('获取学习历史错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
};

// 查询单词定义
export const lookupWord = async (req, res) => {
  try {
    const { word, context } = req.body;

    if (!word) {
      return res.status(400).json({ error: '请提供要查询的单词' });
    }

    if (!context) {
      return res.status(400).json({ error: '请提供上下文句子' });
    }

    // 调用智谱AI查询单词
    const definition = await zhipuService.lookupWord(word, context);

    res.json({
      definition
    });
  } catch (error) {
    console.error('单词查询错误:', error);
    res.status(500).json({ error: '单词查询失败' });
  }
};
