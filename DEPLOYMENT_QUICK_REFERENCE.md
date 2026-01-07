# 🚀 ReCite AI 部署快速参考

> 完整的配置信息和检查清单

---

## 📌 重要配置信息

### MongoDB Atlas
```
连接字符串: mongodb+srv://reciteai:Aa123456...@cluster0.aohsba8.mongodb.net/?appName=Cluster0
```

### 智谱AI
```
API Key: 9c5c7dea47394aa7bcc077f4e87484cf.6KFHevM7SULHUydG
API URL: https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### GitHub
```
仓库地址: https://github.com/XavierY-an/reciteai.git
```

---

## 🔧 Render 后端配置

### 服务配置
| 配置项 | 值 |
|--------|-----|
| Name | `reciteai-backend` |
| Runtime | `Node` |
| Root Directory | `backend` ⭐ |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check | `/health` |

### 环境变量清单
```
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://reciteai:Aa123456...@cluster0.aohsba8.mongodb.net/?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-2024-reciteai
JWT_EXPIRES_IN=7d
ZHIPU_API_KEY=9c5c7dea47394aa7bcc077f4e87484cf.6KFHevM7SULHUydG
ZHIPU_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
FRONTEND_URL=https://reciteai.vercel.app
```

---

## 🔷 Vercel 前端配置

### 项目配置
| 配置项 | 值 |
|--------|-----|
| Project Name | `reciteai` |
| Framework | `Vite` |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 环境变量
```
VITE_API_URL=https://reciteai-backend.onrender.com
```

---

## ✅ 部署步骤检查清单

### 步骤 1: 推送到GitHub
- [ ] 在项目文件夹打开命令行
- [ ] 运行: `git push`
- [ ] 访问 https://github.com/XavierY-an/reciteai 确认推送成功

### 步骤 2: 部署后端到Render
- [ ] 登录 https://dashboard.render.com
- [ ] New+ → Web Service
- [ ] 连接GitHub仓库 `reciteai`
- [ ] 配置服务（见上方配置表）
- [ ] 添加所有环境变量（⭐复制粘贴上方清单）
- [ ] Create Web Service
- [ ] 等待3-5分钟
- [ ] 访问 https://reciteai-backend.onrender.com/health 测试
- [ ] 确认看到: `{"status":"ok","message":"ReCite AI Backend is running"}`

### 步骤 3: 部署前端到Vercel
- [ ] 登录 https://vercel.com/dashboard
- [ ] Add New → Project
- [ ] 导入GitHub仓库 `reciteai`
- [ ] 配置项目（见上方配置表）
- [ ] 添加环境变量: `VITE_API_URL`
- [ ] Deploy
- [ ] 等待1-2分钟
- [ ] 访问前端地址测试

### 步骤 4: 更新CORS
- [ ] 回到Render
- [ ] 找到 `reciteai-backend` 服务
- [ ] Environment → 编辑 `FRONTEND_URL`
- [ ] 改为实际的Vercel地址
- [ ] Save Changes
- [ ] 等待重新部署

### 步骤 5: 完整测试
- [ ] 访问前端首页
- [ ] 注册新账号
- [ ] 测试生成记忆卡片（验证智谱AI）
- [ ] 测试文章库
- [ ] 测试用户中心

---

## 🧪 测试URL清单

### 后端测试
```
健康检查: https://reciteai-backend.onrender.com/health
用户注册: POST https://reciteai-backend.onrender.com/api/auth/register
```

### 前端访问
```
主页面: https://reciteai.vercel.app
```

---

## ⚠️ 最常见的错误

### 1. Root Directory 设置错误
❌ 错误: `./` 或 `.`
✅ 正确: `backend`

### 2. 忘记设置环境变量
⭐ 在Render中复制粘贴上方环境变量清单

### 3. CORS配置错误
⭐ 部署完前端后，必须回到Render更新FRONTEND_URL

### 4. API Key未更新
⭐ 必须使用新的智谱API Key: `9c5c7dea47394aa7bcc077f4e87484cf.6KFHevM7SULHUydG`

---

## 📞 获取帮助

如果遇到问题，检查以下内容：

1. **Render Logs** - 查看后端错误日志
2. **Vercel Deployments** - 查看前端部署日志
3. **浏览器Console** - 按F12查看前端错误
4. **Network请求** - 按F12 → Network查看API请求

---

## 🎉 成功标志

✅ 后端健康检查返回: `{"status":"ok","message":"ReCite AI Backend is running"}`
✅ 前端能正常打开并显示页面
✅ 能注册登录
✅ 能生成记忆卡片（AI分析成功）

---

**祝你部署成功！💪**
