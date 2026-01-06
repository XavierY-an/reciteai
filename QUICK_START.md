# ReCite AI 上线超简单教程

不懂技术也能上线！跟着做就行！

---

## 🎯 你要做什么？

把你的 ReCite AI 应用放到网上，让所有人都能用！

只需要 3 个平台：
1. **MongoDB Atlas** - 免费数据库
2. **Render** - 免费后端服务器
3. **Vercel** - 免费前端服务器

全部都是免费的！💰

---

## 📝 准备工作（5 分钟）

### 第一步：注册账号

打开浏览器，依次访问并注册：

| 平台 | 网址 | 用途 | 时间 |
|------|------|------|------|
| GitHub | https://github.com | 存放代码 | 2 分钟 |
| MongoDB | https://www.mongodb.com/cloud/atlas | 数据库 | 2 分钟 |
| Render | https://render.com | 后端服务器 | 1 分钟 |
| Vercel | https://vercel.com | 前端服务器 | 1 分钟 |

**小贴士：** 全部用 GitHub 登录最方便！

---

## 🗄️ 第二步：配置数据库（10 分钟）

### 2.1 创建免费数据库

```
MongoDB Atlas → Build a Database → FREE → Create
```

等待 2-3 分钟...

### 2.2 创建用户名密码

```
Database Access → Add New Database User
```

填写：
- 用户名：reciteai
- 密码：**记住这个密码！**（比如：MyPass123）
- 权限：Read and write to any database

### 2.3 允许任何人访问

```
Network Access → Add IP Address → ALLOW ACCESS FROM ANYWHERE
```

### 2.4 复制连接字符串

```
Database → Connect → Connect your application
```

你会看到类似这样的：
```
mongodb+srv://reciteai:<password>@reciteai.xxxxx.mongodb.net/...
```

**重点：** 把 `<password>` 替换成你的密码（MyPass123）

替换后变成：
```
mongodb+srv://reciteai:MyPass123@reciteai.xxxxx.mongodb.net/...
```

**复制这个字符串！** 一会儿要用！

---

## 📤 第三步：上传代码到 GitHub（10 分钟）

### 3.1 创建仓库

```
GitHub → 右上角 + → New repository
```

填写：
- Repository name：reciteai
- 选 Public（公开）
- Create repository

### 3.2 上传文件

点击 "uploading an existing file"

把电脑上的这些文件拖进去：

```
✓ backend 文件夹（整个）
✓ components 文件夹
✓ services 文件夹
✓ App.tsx
✓ index.html
✓ package.json
✓ 其他配置文件...
```

**注意：** 不要上传 `.env` 文件！

最后点击 "Commit changes"

---

## 🚀 第四步：部署后端（15 分钟）

### 4.1 创建服务

```
Render Dashboard → New → Web Service → Connect GitHub
```

找到你的 reciteai 仓库，点击 Connect

### 4.2 填写配置

| 项目 | 填写内容 |
|------|---------|
| Name | reciteai-backend |
| Environment | Node |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && node server.js` |

### 4.3 添加环境变量（重要！）

点击 "Advanced" → "Add Environment Variable"

依次添加 6 个变量：

**1. PORT**
```
PORT = 3001
```

**2. MONGODB_URI**（第二步复制的那个）
```
MONGODB_URI = mongodb+srv://reciteai:MyPass123@xxx...
```

**3. JWT_SECRET**（随意）
```
JWT_SECRET = my-secret-key-2024
```

**4. JWT_EXPIRES_IN**
```
JWT_EXPIRES_IN = 7d
```

**5. ZHIPU_API_KEY**（你的智谱 API Key）
```
ZHIPU_API_KEY = 你的API密钥
```

**6. FRONTEND_URL**（先填临时的）
```
FRONTEND_URL = https://vercel.com
```

### 4.4 开始部署

点击 "Deploy Web Service"

等待 3-5 分钟... 看到 "Live" 就成功了！

### 4.5 复制后端地址

在页面顶部找到：
```
https://reciteai-backend.onrender.com
```

**复制这个地址！** 一会儿要用！

---

## 🎨 第五步：部署前端（5 分钟）

### 5.1 创建项目

```
Vercel Dashboard → Add New → Project
```

找到 reciteai 仓库，点击 Import

### 5.2 配置项目

| 项目 | 选择/填写 |
|------|----------|
| Framework Preset | Vite |
| Root Directory | （不填） |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 5.3 添加环境变量

"Environment Variables" → "Add New"

```
Name: VITE_API_URL
Value: https://reciteai-backend.onrender.com
```

（Value 是你第四步复制的那個地址）

点击 "Add"

### 5.4 部署

点击 "Deploy"

等待 1-2 分钟... 看到 "Congratulations!"

复制你的前端地址：
```
https://reciteai.vercel.app
```

---

## 🔄 第六步：更新设置（2 分钟）

### 更新后端的 FRONTEND_URL

1. 回到 Render
2. 打开 reciteai-backend 服务
3. 点击 "Environment"
4. 找到 FRONTEND_URL
5. 改成：`https://reciteai.vercel.app`
6. 保存

---

## ✅ 第七步：测试！

访问你的网站：`https://reciteai.vercel.app`

测试功能：
- [ ] 能打开网页
- [ ] 能注册账号
- [ ] 能登录
- [ ] 能输入英文生成卡片
- [ ] 能查看文章库

全部成功？恭喜你！🎉

---

## 📱 分享你的网站

现在你可以：
- 把链接发给朋友
- 发朋友圈/社交媒体
- 添加到手机主屏幕
- 随时随地使用！

**你的网站地址：**
```
https://reciteai.vercel.app
```

---

## 💡 小贴士

### 如何避免后端休眠？

Render 免费版 15 分钟不用会"睡觉"（访问慢）

**解决方法：**
使用 https://healthchecks.io/ 每 10 分钟 ping 一次

### 想要自定义域名？

比如 `www.myapp.com`

1. 买域名（阿里云/腾讯云，约 50 元/年）
2. Vercel → Settings → Domains → 添加域名
3. 按提示配置 DNS

### 想要 24 小时运行？

升级 Render 付费计划：约 50 元/月

---

## 🆘 遇到问题？

### 问题 1：部署失败

**检查：**
- Build Command：`cd backend && npm install`
- Start Command：`cd backend && node server.js`

### 问题 2：数据库连不上

**检查：**
- MongoDB 是否设置了 "Allow Access from Anywhere"
- MONGODB_URI 中的密码是否正确替换

### 问题 3：前端连不上后端

**检查：**
- VITE_API_URL 是否正确（包含 https://）
- Render 的 FRONTEND_URL 是否包含前端地址

---

## 📚 更多帮助

详细说明请查看：
- `DEPLOYMENT_STEP_BY_STEP.md` - 完整教程
- `CHECKLIST.md` - 检查清单
- `ENV_TEMPLATE.md` - 环境变量模板

---

## 🎊 完成！

你做到了！

现在你有了一个：
- ✅ 全球可访问的网站
- ✅ 免费的数据库
- ✅ 免费的服务器
- ✅ 完整的用户系统
- ✅ AI 智能功能

**下一步：**
- 分享给朋友
- 收集反馈
- 持续优化

加油！💪
