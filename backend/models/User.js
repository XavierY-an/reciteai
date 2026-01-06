import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // 默认查询时不返回密码
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random()
  },
  isPro: {
    type: Boolean,
    default: false
  },
  proExpireAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
