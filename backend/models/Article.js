import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  id: String,
  text: String,
  translation: String,
  isHidden: { type: Boolean, default: true },
  role: String
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  translation: String,
  theme: { type: String, enum: ['blue', 'emerald', 'violet', 'amber'] },
  segments: [segmentSchema]
}, { _id: false });

const articleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: '未命名文章'
  },
  content: {
    type: String,
    required: true
  },
  originalImage: {
    type: String,
    default: null
  },
  // AI 分析结果
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  sections: [sectionSchema]
}, {
  timestamps: true
});

// 复合索引
articleSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Article', articleSchema);
