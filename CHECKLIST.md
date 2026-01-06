# ReCite AI 上线检查清单

打印这个清单，完成一项打一个 ✅

---

## 准备阶段

- [x] 已注册 GitHub 账号
- [x] 已注册 MongoDB Atlas 账号
- [x] 已注册 Vercel 账号
- [x] 已注册 Render 账号
- [x] 已准备好智谱 AI API Key

---

## 第一步：MongoDB 数据库

### 1.1 创建集群
- [x] 登录 https://www.mongodb.com/cloud/atlas
- [x] 点击 "Build a Database"
- [x] 选择 FREE 方案
- [x] 创建集群（等待 2-3 分钟）

### 1.2 创建用户
- [ ] Database Access → Add New Database User
- [ ] 用户名：reciteai
- [ ] 密码：（**记住密码！**）
- [ ] 权限：Read and write to any database

### 1.3 IP 白名单
- [ ] Network Access → Add IP Address
- [ ] 点击 "ALLOW ACCESS FROM ANYWHERE"
- [ ] Confirm

### 1.4 获取连接字符串
- [ ] Database → Connect → Connect your application
- [ ] 复制连接字符串
- [ ] 替换 `<password>` 为实际密码
- [ ] **保存这个字符串！** （格式类似：mongodb+srv://reciteai:密码@xxx.mongodb.net/）

---

## 第二步：GitHub 代码仓库

### 2.1 创建仓库
- [ ] 登录 https://github.com
- [ ] 点击 "+" → "New repository"
- [ ] 仓库名：reciteai
- [ ] 选择 Public
- [ ] Create repository

### 2.2 上传代码
- [ ] 点击 "uploading an existing file"
- [ ] 拖拽上传所有文件
- [ ] **不要上传 .env 文件！**
- [ ] Commit changes

---

## 第三步：部署后端（Render）

### 3.1 创建服务
- [ ] 登录 https://dashboard.render.com
- [ ] New → Web Service
- [ ] Connect GitHub → 选择 reciteai 仓库
- [ ] Connect

### 3.2 配置服务
- [ ] Name: reciteai-backend
- [ ] Environment: Node
- [ ] Build Command: `cd backend && npm install`
- [ ] Start Command: `cd backend && node server.js`

### 3.3 环境变量（重要！）
点击 Advanced → Add Environment Variable，依次添加：

- [ ] `PORT` = `3001`
- [ ] `MONGODB_URI` = （你的 MongoDB 连接字符串）
- [ ] `JWT_SECRET` = `my-super-secret-jwt-key-2024-reciteai`
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `ZHIPU_API_KEY` = （你的智谱 API Key）
- [ ] `FRONTEND_URL` = `https://vercel.com` （临时，稍后更新）

### 3.4 部署
- [ ] 点击 "Deploy Web Service"
- [ ] 等待 3-5 分钟
- [ ] 看到 "Live" 状态

### 3.5 获取后端地址
- [ ] 复制 Render 地址，如：`https://reciteai-backend.onrender.com`
- [ ] 点击访问，看到：`{"status":"ok"}`
- [ ] **保存这个地址！**

---

## 第四步：部署前端（Vercel）

### 4.1 创建项目
- [ ] 登录 https://vercel.com/dashboard
- [ ] Add New → Project
- [ ] 找到 reciteai 仓库
- [ ] Import

### 4.2 配置项目
- [ ] Framework Preset: Vite
- [ ] Root Directory: （留空）
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 4.3 环境变量
- [ ] Environment Variables → Add New
- [ ] Name: `VITE_API_URL`
- [ ] Value: （你的 Render 地址，如 https://reciteai-backend.onrender.com）
- [ ] Add

### 4.4 部署
- [ ] 点击 "Deploy"
- [ ] 等待 1-2 分钟
- [ ] 看到 "Congratulations!"
- [ ] 复制 Vercel 地址，如：`https://reciteai.vercel.app`

---

## 第五步：更新 CORS 设置

- [ ] 回到 Render
- [ ] 打开 reciteai-backend 服务
- [ ] Environment 标签
- [ ] 编辑 `FRONTEND_URL`
- [ ] 改为：（你的 Vercel 地址）
- [ ] 保存（自动重新部署）

---

## 第六步：测试

访问你的 Vercel 地址，测试以下功能：

- [ ] 页面能正常打开
- [ ] 可以注册新账号
- [ ] 注册后能登录
- [ ] 输入英文文本能生成卡片
- [ ] 点击"文章库"能看到文章列表
- [ ] 能删除文章
- [ ] OCR 拍照识别功能正常

---

## 第七步：分享链接

恭喜！🎉 你的应用已经上线了！

**你的应用地址：**
```
https://reciteai.vercel.app
```

**后端 API 地址：**
```
https://reciteai-backend.onrender.com
```

**数据库地址：**
```
MongoDB Atlas (你的集群)
```

现在你可以：
- 把链接分享给朋友
- 发到朋友圈
- 添加到手机主屏幕
- 开始使用！

---

## 预计时间

- MongoDB 配置：10 分钟
- GitHub 上传：10 分钟
- Render 部署：15 分钟
- Vercel 部署：5 分钟
- 测试调试：10 分钟

**总计：约 50 分钟**

---

## 重要信息保存（剪贴）

**MongoDB 连接字符串：**
```
（粘贴到这里）

```

**MongoDB 密码：**
```
（粘贴到这里）

```

**智谱 API Key：**
```
（粘贴到这里）

```

**Render 后端地址：**
```
（粘贴到这里）

```

**Vercel 前端地址：**
```
（粘贴到这里）

```

---

## 需要帮助？

如果卡在某一步：
1. 查看 `DEPLOYMENT_STEP_BY_STEP.md` 详细说明
2. 查看部署日志（错误信息）
3. 检查环境变量是否正确
4. 确认每一步都按顺序完成

加油！你能做到的！💪
