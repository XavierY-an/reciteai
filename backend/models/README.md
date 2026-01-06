# 数据库模型设计

## 核心实体

### 1. User（用户）

```javascript
{
  _id: ObjectId,
  name: String,           // 用户名
  email: String,          // 邮箱（登录用）
  password: String,       // 加密密码
  avatar: String,         // 头像 URL
  isPro: Boolean,         // 是否 Pro 会员
  proExpireAt: Date,      // Pro 过期时间
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Article（文章）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // 关联用户

  // 基本信息
  title: String,          // 文章标题（可选，AI 生成或用户输入）
  content: String,        // 原始文本内容
  originalImage: String,  // 如果是 OCR 上传，保存原图 URL

  // AI 分析结果
  difficulty: String,     // 难度等级：'beginner' | 'intermediate' | 'advanced'
  wordCount: Number,      // 字数
  segments: [             // 拆分后的学习段落
    {
      id: String,
      title: String,      // 段落标题
      translation: String,// 中文翻译
      theme: String,      // 颜色主题
      segments: [         // 语义片段
        {
          id: String,
          text: String,           // 原文
          translation: String,    // 中文意思
          isHidden: Boolean,
          role: String            // 语法角色：'SUBJECT' | 'VERB' | 'OBJECT' ...
        }
      ]
    }
  ],

  createdAt: Date,
  updatedAt: Date
}
```

### 3. StudyRecord（学习记录）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // 关联用户
  articleId: ObjectId,    // 关联文章

  // 学习进度
  currentSection: Number, // 当前学习到第几个段落（0-based）
  completedSections: [Number],  // 已完成的段落索引
  progress: Number,       // 进度百分比 0-100

  // 背诵历史
  reciteHistory: [
    {
      score: Number,           // 得分
      feedback: String,        // AI 反馈
      detailedAnalysis: [      // 逐词分析
        {
          word: String,
          status: String,      // 'correct' | 'missed' | 'wrong' | 'extra'
          correctedWord: String
        }
      ],
      timestamp: Date
    }
  ],

  lastStudiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 索引设计

```javascript
// User 索引
db.users.createIndex({ email: 1 }, { unique: true })

// Article 索引
db.articles.createIndex({ userId: 1 })
db.articles.createIndex({ userId: 1, createdAt: -1 })

// StudyRecord 索引
db.studyRecords.createIndex({ userId: 1, articleId: 1 }, { unique: true })
db.studyRecords.createIndex({ userId: 1, lastStudiedAt: -1 })
```

## API 设计概览

### 用户相关
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `POST /api/user/upgrade` - 升级 Pro

### 文章相关
- `POST /api/articles` - 创建文章（上传文本/图片）
- `GET /api/articles` - 获取用户的所有文章
- `GET /api/articles/:id` - 获取文章详情
- `DELETE /api/articles/:id` - 删除文章

### 学习相关
- `GET /api/study/:articleId` - 获取文章的学习记录
- `PUT /api/study/:articleId/progress` - 更新学习进度
- `POST /api/study/:articleId/recite` - 提交背诵结果
- `GET /api/study/history` - 获取学习历史列表

### AI 相关
- `POST /api/ai/analyze` - 分析文本（智能拆分）
- `POST /api/ai/ocr` - 图片识别
- `POST /api/ai/evaluate` - 评估背诵结果
