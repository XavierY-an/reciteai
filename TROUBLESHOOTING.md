# 常见问题快速解决

## 部署失败？看这里！

---

## 🚨 问题 1：Render 部署失败

### 错误信息：
```
Error: Cannot find module
```

### 原因：
Build Command 或 Start Command 路径不对

### 解决：
```
Build Command: cd backend && npm install
Start Command: cd backend && node server.js
```

---

## 🚨 问题 2：MongoDB 连接失败

### 错误信息：
```
MongoServerError: Authentication failed
```

### 原因：
密码错误或用户不存在

### 解决步骤：
1. 检查 MONGODB_URI 中的密码
2. 确认 `<password>` 已替换为实际密码
3. 确认没有多余的空格

**正确的格式：**
```
mongodb+srv://reciteai:MyPass123@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🚨 问题 3：CORS 错误

### 错误信息（浏览器控制台）：
```
Access to fetch at 'xxx' from origin 'yyy' has been blocked by CORS policy
```

### 原因：
跨域配置错误

### 解决：
1. 确认 Render 环境变量 `FRONTEND_URL` 包含前端地址
2. 确认前端环境变量 `VITE_API_URL` 包含后端地址
3. 两个地址都要带 `https://`

**示例：**
```
Render - FRONTEND_URL: https://reciteai.vercel.app
Vercel - VITE_API_URL: https://reciteai-backend.onrender.com
```

---

## 🚨 问题 4：前端打不开（404）

### 错误信息：
```
404: Page not found
```

### 原因：
Vercel 构建失败

### 解决：
1. 访问 Vercel Dashboard
2. 找到项目 → Deployments
3. 查看最新部署的日志
4. 常见原因：
   - 缺少 `package.json`
   - Build Command 错误

**正确的配置：**
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

---

## 🚨 问题 5：智谱 API 调用失败

### 错误信息：
```
Error: AI 服务调用失败
```

### 原因：
API Key 错误或余额不足

### 解决：
1. 访问 https://open.bigmodel.cn/
2. 检查 API Key 是否正确复制
3. 检查账户余额
4. 重新生成 API Key

---

## 🚨 问题 6：后端休眠（访问慢）

### 现象：
首次访问需要等 30-60 秒

### 原因：
Render 免费版会自动休眠

### 解决：
使用监控服务定期唤醒：
1. 访问 https://healthchecks.io/
2. 注册账号（免费）
3. 创建一个 check
4. URL 填你的后端地址
5. 设置每 10 分钟检查一次
6. 这样后端就不会休眠了

---

## 🚨 问题 7：GitHub 上传失败

### 错误信息：
```
This file is too large
```

### 原因：
文件超过 100 MB

### 解决：
1. 删除 `node_modules` 文件夹
2. 删除 `.env` 文件
3. 只上传代码文件，不上传依赖

**应该上传的文件：**
```
✅ backend/, components/, services/
✅ *.tsx, *.ts, *.json
✅ *.html, *.md
```

**不应该上传的：**
```
❌ node_modules/
❌ .env
❌ dist/
❌ .DS_Store
```

---

## 🚨 问题 8：环境变量不生效

### 现象：
修改环境变量后没有变化

### 解决：

**Render：**
- 编辑环境变量后会自动重新部署
- 等待 2-3 分钟

**Vercel：**
- 编辑环境变量后需要手动部署
- 项目 → Deployments → 最新部署 → Redeploy

---

## 🔍 如何查看错误日志？

### Render 日志：
1. 打开服务页面
2. 点击 "Logs" 标签
3. 查看实时日志

### Vercel 日志：
1. 打开项目页面
2. 点击 "Deployments"
3. 点击最新部署的 ID
4. 查看 "Build Log" 或 "Function Log"

### 浏览器控制台：
1. 打开网站
2. 按 F12
3. 查看 Console 标签

---

## 📞 还是不行？

### 完整检查清单：

1. **MongoDB**
   - [ ] 集群已创建
   - [ ] 用户已创建
   - [ ] IP 白名单已设置
   - [ ] 连接字符串正确

2. **Render**
   - [ ] 环境变量全部填写
   - [ ] 没有多余空格
   - [ ] Build Command 正确
   - [ ] Start Command 正确

3. **Vercel**
   - [ ] 环境变量已填写
   - [ ] Framework 选择 Vite
   - [ ] 部署成功

### 重新部署：

**从头开始：**
1. 删除 Render 服务
2. 删除 Vercel 项目
3. 仔细检查环境变量
4. 重新创建

### 寻求帮助：

1. 查看官方文档：
   - MongoDB: https://docs.atlas.mongodb.com/
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs

2. 搜索错误信息

3. 查看我们的详细教程

---

## 💡 预防措施

### 部署前检查：
- [ ] 所有环境变量已准备
- [ ] MongoDB 连接字符串已测试
- [ ] 智谱 API Key 已确认
- [ ] 代码已提交到 GitHub

### 部署后测试：
- [ ] 后端健康检查（/health）
- [ ] 前端能打开
- [ ] 注册/登录功能
- [ ] 核心功能正常

---

## ✅ 成功标志

当你看到这些，说明成功了！

**Render：**
```
Status: Live (green)
```

**Vercel：**
```
Ready: ✓
```

**浏览器：**
```
你的网站正常显示
```

**测试：**
```
✅ 注册成功
✅ 登录成功
✅ 功能正常
```

---

## 🎉 恭喜！

如果所有测试都通过了，你就成功了！

现在可以：
- 分享你的网站
- 添加更多功能
- 优化用户体验

继续保持！💪
