import mongoose from 'mongoose';

const wordResultSchema = new mongoose.Schema({
  word: String,
  status: { type: String, enum: ['correct', 'missed', 'wrong', 'extra'] },
  correctedWord: String
}, { _id: false });

const reciteHistorySchema = new mongoose.Schema({
  score: Number,
  feedback: String,
  detailedAnalysis: [wordResultSchema],
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const studyRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true
  },
  // 学习进度
  currentSection: {
    type: Number,
    default: 0
  },
  completedSections: {
    type: [Number],
    default: []
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // 背诵历史
  reciteHistory: [reciteHistorySchema],
  lastStudiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 复合唯一索引：一个用户对一篇文章只能有一条学习记录
studyRecordSchema.index({ userId: 1, articleId: 1 }, { unique: true });
studyRecordSchema.index({ userId: 1, lastStudiedAt: -1 });

export default mongoose.model('StudyRecord', studyRecordSchema);
