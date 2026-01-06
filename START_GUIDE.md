# ReCite AI - 启动指南

## 项目概述

ReCite AI 是一个智能英语背诵辅助应用，已集成：
- ✅ **后端 API**（Node.js + Express + MongoDB）
- ✅ **智谱 GLM AI**（文本分析 + OCR 图片识别）
- ✅ **用户系统**（注册/登录/Pro 会员）
- ✅ **文章管理**（创建/查询/删除）
- ✅ **智能拆分**（根据难度动态划分）

---

## 前置要求

### 1. 安装 MongoDB
```bash
# macOS (使用 Homebrew)
brew install mongodb-community
brew services start mongodb-community

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. 获取智谱 API Key
访问 [智谱 AI 开放平台](https://open.bigmodel.cn/) 注册并获取 API Key

---

## 启动步骤

### 第一步：配置后端环境

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，填入你的智谱 API Key
# ZHIPU_API_KEY=your-actual-api-key
```

### 第二步：启动后端服务

```bash
cd backend
npm run dev
```

看到以下输出说明启动成功：
```
MongoDB 连接成功: localhost:27017
Server running on http://localhost:3001
```

### 第三步：启动前端服务

打开新终端窗口：

```bash
# 在项目根目录
npm install
npm run dev
```

前端会运行在: http://localhost:5173

---

## 功能测试流程

### 1. 注册/登录
- 访问 http://localhost:5173
- 点击"登录" → "还没有账号？立即注册"
- 填写用户名、邮箱、密码完成注册

### 2. 创建文章（文本输入）
- 点击"试一试例句"或粘贴英文文本
- 点击"生成记忆卡片"
- 后端会自动：
  - 分析文本难度（beginner/intermediate/advanced）
  - 智能拆分成学习段落
  - 为每个片段标注语法角色

### 3. 创建文章（OCR 拍照识别）
- 在文本输入框点击"拍照识别"
- 上传包含英文的图片
- 智谱 GLM-4V 会自动识别文字

### 4. 查看文章库
- 登录后在首页点击"文章库"按钮
- 可以看到所有已创建的文章
- 点击文章可以继续学习
- 点击删除图标可以删除文章

### 5. 学习模式
- 在学习页面点击卡片可以显示/隐藏片段
- 不同颜色代表不同的语义角色
- 完成学习后进入背诵模式

### 6. 背诵评估
- 口头背诵原文
- 系统会对比原文给出评分和详细反馈
- 评估结果会保存到学习记录

---

## API 端点说明

### 认证相关
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/upgrade` - 升级 Pro

### 文章相关
- `POST /api/articles` - 创建文章
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `DELETE /api/articles/:id` - 删除文章
- `POST /api/articles/ocr` - OCR 图片识别

### 学习相关
- `GET /api/study/:articleId` - 获取学习记录
- `PUT /api/study/:articleId/progress` - 更新学习进度
- `POST /api/study/:articleId/recite` - 提交背诵结果
- `GET /api/study/history` - 获取学习历史

---

## 项目结构

```
ReCite Ai/
├── backend/                 # 后端服务
│   ├── config/             # 配置文件
│   ├── models/             # Mongoose 模型
│   ├── routes/             # API 路由
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── services/           # 服务层（智谱 AI）
│   ├── server.js           # 入口文件
│   └── package.json
│
├── components/             # 前端组件
│   ├── LoginView.tsx       # 登录/注册
│   ├── StudyView.tsx       # 学习模式
│   ├── ReciteView.tsx      # 背诵模式
│   ├── ArticleListView.tsx # 文章列表
│   └── ...
│
├── services/               # 前端服务层
│   ├── apiClient.ts        # API 客户端
│   ├── authServiceNew.ts   # 认证服务
│   ├── articleService.ts   # 文章服务
│   └── studyService.ts     # 学习服务
│
├── App.tsx                 # 主应用
├── types.ts                # 类型定义
└── package.json
```

---

## 智能拆分策略

系统会根据文本难度自动调整拆分策略：

### Beginner（初级）
- 每个句子拆分成 3-5 个片段
- 每个片段尽量简短（2-4 个单词）
- 重点标记主语、谓语、宾语
- 提供详细的中文翻译

### Intermediate（中级）
- 每个句子拆分成 5-8 个片段
- 平衡片段长度，便于记忆
- 重点标记语法成分
- 提供准确的中文翻译

### Advanced（高级）
- 按照语义和逻辑关系拆分
- 保持较长语块的完整性
- 重点关注从句和非谓语动词结构
- 提供准确的翻译

---

## 故障排查

### MongoDB 连接失败
```bash
# 检查 MongoDB 是否运行
brew services list | grep mongodb

# 重启 MongoDB
brew services restart mongodb-community
```

### 后端启动失败
```bash
# 检查端口 3001 是否被占用
lsof -i :3001

# 更换端口（修改 backend/.env）
PORT=3002
```

### 智谱 API 调用失败
- 检查 API Key 是否正确
- 确认账户有足够的调用额度
- 查看后端日志获取详细错误信息

### 前端无法连接后端
- 确认后端服务正在运行（http://localhost:3001）
- 检查 `.env.local` 中的 `VITE_API_URL` 是否正确
- 查看浏览器控制台的错误信息

---

## 下一步优化建议

1. **学习进度持久化**：保存每个段落的学习状态
2. **复习提醒**：基于艾宾浩斯遗忘曲线的复习提醒
3. **数据统计**：学习时长、背诵准确率等统计图表
4. **社交功能**：分享学习成果、排行榜等
5. **更多 AI 功能**：语法解释、重点词汇提取等

---

## 技术支持

如有问题，请检查：
1. 后端日志（终端输出）
2. 前端控制台（浏览器 F12）
3. MongoDB 数据（使用 Compass 或命令行）
