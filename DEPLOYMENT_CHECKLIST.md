# 🚀 ReCite AI 线上部署完整指南

> 从零开始部署到 Render + Vercel

---

## 📋 部署前准备

### ✅ 已完成
- [x] 项目代码准备完成
- [x] MongoDB Atlas 数据库已配置
- [x] 智谱AI API Key 已更新

### 📝 需要的信息
请准备好以下信息（按需填写在部署时）：

**MongoDB Atlas:**
- 连接字符串：`mongodb+srv://reciteai:Aa123456...@cluster0.aohsba8.mongodb.net/?appName=Cluster0`

**智谱AI:**
- API Key：`9c5c7dea47394aa7bcc077f4e87484cf.6KFHevM7SULHUydG`

**GitHub:**
- 仓库地址：`https://github.com/XavierY-an/reciteai.git`

---

## 步骤1️⃣：推送代码到GitHub

由于网络问题，请手动执行以下操作：

### 方法A：使用VS Code
1. 打开 VS Code
2. 打开项目文件夹：`D:\claude code\English\ReCite Ai`
3. 点击左侧源代码管理图标（或按 Ctrl+Shift+G）
4. 点击"提交"按钮，输入提交信息：`"Update for deployment"`
5. 点击"推送"按钮（或按 F1 → 输入 "git push"）

### 方法B：使用命令行
```bash
# 打开命令提示符（cmd）
cd /d "D:\claude code\English\ReCite Ai"
git push
```

### 验证
推送成功后，访问：
```
https://github.com/XavierY-an/reciteai
```
应该能看到最新的代码。

---

## 步骤2️⃣：部署后端到Render

### 2.1 登录Render
1. 访问：https://dashboard.render.com
2. 如果没有账号，先注册（可以用GitHub账号登录）

### 2.2 创建新的Web服务

1. 点击右上角 **"New +"** 按钮
2. 选择 **"Web Service"**

### 2.3 连接GitHub仓库

1. 点击 **"Connect GitHub"**
2. 授权Render访问你的GitHub
3. 在仓库列表中找到并选择 **`reciteai`**
4. 点击 **"Connect"**

### 2.4 配置后端服务（⭐ 最重要）

填写以下配置：

| 配置项 | 值 |
|--------|-----|
| **Name** | `reciteai-backend` |
| **Region** | `Singapore` (或选择离你最近的) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Root Directory** | `backend` ⭐⭐⭐ |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 2.5 配置环境变量（⭐ 关键）

在 "Advanced" 部分，点击 "Add Environment Variable"，逐个添加：

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://reciteai:Aa123456...@cluster0.aohsba8.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `my-super-secret-jwt-key-2024-reciteai` |
| `JWT_EXPIRES_IN` | `7d` |
| `ZHIPU_API_KEY` | `9c5c7dea47394aa7bcc077f4e87484cf.6KFHevM7SULHUydG` |
| `ZHIPU_API_URL` | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| `FRONTEND_URL` | `https://reciteai.vercel.app` |

### 2.6 部署

1. 检查所有配置无误
2. 点击页面底部的 **"Create Web Service"**
3. 等待3-5分钟部署完成

### 2.7 验证后端部署

**查看日志：**
1. 在服务页面点击 **"Logs"** 标签
2. 应该看到类似这样的信息：
   ```
   MongoDB 连接成功: ac-xxxxx.mongodb.net
   Server running on port 3001
   Environment: production
   ```

**测试健康检查：**
在浏览器访问：
```
https://reciteai-backend.onrender.com/health
```

应该看到：
```json
{"status":"ok","message":"ReCite AI Backend is running"}
```

✅ **如果看到这个，后端部署成功！**

---

## 步骤3️⃣：部署前端到Vercel

### 3.1 登录Vercel
1. 访问：https://vercel.com/dashboard
2. 如果没有账号，先注册（可以用GitHub账号登录）

### 3.2 创建新项目

1. 点击 **"Add New..."** → **"Project"**
2. 点击 **"Import Git Repository"**

### 3.3 导入GitHub仓库

1. 找到并选择 **`reciteai`** 仓库
2. 或者输入仓库地址：`https://github.com/XavierY-an/reciteai.git`
3. 点击 **"Import"**

### 3.4 配置前端项目

填写以下配置：

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `reciteai` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (根目录) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.5 配置环境变量（⭐ 重要）

在 "Environment Variables" 部分，点击 "Add New"：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://reciteai-backend.onrender.com` |

### 3.6 部署

1. 确认所有配置无误
2. 点击 **"Deploy"** 按钮
3. 等待1-2分钟部署完成

### 3.7 获取前端地址

部署成功后，Vercel会自动分配域名：
```
https://reciteai.vercel.app
```
（或者类似：`https://reciteai-xyz.vercel.app`）

---

## 步骤4️⃣：更新CORS配置（⭐ 必做！）

前端部署完成后，需要更新后端的CORS配置：

### 4.1 回到Render

1. 访问：https://dashboard.render.com
2. 找到 `reciteai-backend` 服务
3. 点击进入

### 4.2 更新环境变量

1. 点击 **"Environment"** 标签
2. 找到 `FRONTEND_URL` 变量
3. 点击编辑
4. 改为你的实际Vercel地址（如：`https://reciteai.vercel.app`）
5. 点击 **"Save Changes"**

### 4.3 等待重新部署

保存后，Render会自动重新部署（约1-2分钟）

---

## 步骤5️⃣：完整功能测试

### 5.1 访问前端

在浏览器打开：
```
https://reciteai.vercel.app
```

### 5.2 测试清单

**基础功能：**
- [ ] 网站能正常打开，看到首页
- [ ] 点击右上角"登录"按钮
- [ ] 点击"还没有账号？立即注册"
- [ ] 填写信息并注册
- [ ] 注册后自动登录

**核心功能：**
- [ ] 在首页点击"试一试例句"
- [ ] 点击"生成记忆卡片"
- [ ] 等待AI分析（约10-20秒）
- [ ] 查看学习页面的彩色卡片
- [ ] 点击卡片查看中文翻译
- [ ] 完成学习，进入背诵模式

**文章管理：**
- [ ] 点击顶部"文章库"
- [ ] 查看已创建的文章
- [ ] 选择文章继续学习

**用户中心：**
- [ ] 点击用户头像
- [ ] 查看个人信息
- [ ] 测试退出登录

### 5.3 测试结果

✅ **如果所有测试都通过，恭喜你，部署成功！**

---

## 🎯 常见问题解决

### 问题1：后端返回404

**原因：** Root Directory设置错误

**解决：**
1. 在Render服务页面，点击"Settings"
2. 确认"Root Directory"是 `backend`（不是`./`或其他）
3. 保存后重新部署

### 问题2：前端无法连接后端

**原因：** CORS配置错误

**解决：**
1. 确认后端的 `FRONTEND_URL` 环境变量是正确的Vercel地址
2. 确认前端的 `VITE_API_URL` 是正确的Render地址
3. 保存后等待重新部署

### 问题3：AI分析失败

**原因：** 智谱API Key错误

**解决：**
1. 确认后端的 `ZHIPU_API_KEY` 是新的Key：`9c5c7dea47394aa7bcc077f4e87484cf.6KFHevM7SULHUydG`
2. 检查智谱AI账号是否有余额
3. 查看Render Logs的错误信息

### 问题4：MongoDB连接失败

**原因：** 连接字符串错误或IP白名单

**解决：**
1. 确认MongoDB Atlas的IP白名单设置为"Allow Access from Anywhere"
2. 确认连接字符串正确
3. 检查用户名和密码

### 问题5：部署超时

**原因：** Render免费版有冷启动时间

**解决：**
- 首次访问可能需要等待30-60秒
- 这是正常的，属于免费版的限制

---

## 📞 需要帮助？

如果遇到问题，请提供以下信息：

1. **Render服务页面截图**（显示Logs）
2. **Vercel部署状态截图**
3. **浏览器控制台错误**（F12 → Console）
4. **Network请求错误**（F12 → Network）

---

## 🎉 部署成功后的下一步

1. **分享你的应用**
   - 把链接分享给朋友
   - 发到社交媒体

2. **监控使用情况**
   - Render Dashboard 查看访问统计
   - MongoDB Atlas 查看数据统计

3. **持续优化**
   - 收集用户反馈
   - 修复发现的bug
   - 添加新功能

---

**祝你部署顺利！💪**
