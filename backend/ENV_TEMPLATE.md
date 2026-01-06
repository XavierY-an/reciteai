# 环境变量配置模板

## 使用说明

复制下面的内容，填写你的实际信息后，在 Render 环境变量中添加。

---

## Render 后端环境变量

### 1. PORT
```
PORT=3001
```
**说明：** 后端服务端口号，固定为 3001

---

### 2. MONGODB_URI
```
MONGODB_URI=mongodb+srv://reciteai:你的密码@reciteai.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
**如何获取：**
1. 访问 MongoDB Atlas
2. Database → Connect → Connect your application
3. 复制连接字符串
4. 将 `<password>` 替换为你创建数据库用户时设置的密码

**示例：**
```
MONGODB_URI=mongodb+srv://reciteai:MyPassword123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

---

### 3. JWT_SECRET
```
JWT_SECRET=my-super-secret-jwt-key-2024-reciteai-please-change-this
```
**说明：** 用于加密用户令牌，可以随意填写一串复杂字符

**建议：** 使用在线工具生成随机字符串
- https://www.random.org/strings/

**示例：**
```
JWT_SECRET=xK9mP2vL8qW5nR7tY4uB6cD3eF1gH0jI
```

---

### 4. JWT_EXPIRES_IN
```
JWT_EXPIRES_IN=7d
```
**说明：** Token 过期时间，7d 表示 7 天

---

### 5. ZHIPU_API_KEY
```
ZHIPU_API_KEY=你的智谱API密钥
```
**如何获取：**
1. 访问 https://open.bigmodel.cn/
2. 登录/注册
3. 进入控制台
4. API 密钥管理
5. 创建新的 API Key

**示例：**
```
ZHIPU_API_KEY=abc123.def456.ghi789
```

---

### 6. FRONTEND_URL
```
FRONTEND_URL=https://你的项目名.vercel.app
```
**说明：** 前端地址，用于 CORS 跨域设置

**步骤：**
1. 先部署前端到 Vercel
2. 获得 Vercel 地址
3. 回来更新这个变量

**示例：**
```
FRONTEND_URL=https://reciteai-app.vercel.app
```

---

## Vercel 前端环境变量

### VITE_API_URL
```
VITE_API_URL=https://你的后端名.onrender.com
```
**说明：** 后端 API 地址

**步骤：**
1. 先部署后端到 Render
2. 获得 Render 地址
3. 在 Vercel 添加这个环境变量

**示例：**
```
VITE_API_URL=https://reciteai-backend.onrender.com
```

---

## 完整配置示例

### Render 环境变量（7 个）

| Key | Value |
|-----|-------|
| PORT | 3001 |
| MONGODB_URI | mongodb+srv://reciteai:MyPassword123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority |
| JWT_SECRET | xK9mP2vL8qW5nR7tY4uB6cD3eF1gH0jI |
| JWT_EXPIRES_IN | 7d |
| ZHIPU_API_KEY | abc123.def456.ghi789 |
| FRONTEND_URL | https://reciteai.vercel.app |

### Vercel 环境变量（1 个）

| Name | Value |
|-----|-------|
| VITE_API_URL | https://reciteai-backend.onrender.com |

---

## 配置顺序（重要！）

### 第一次部署

1. 配置 Render 环境变量（FRONTEND_URL 临时填 `https://vercel.com`）
2. 部署 Render 后端
3. 获得 Render 地址
4. 配置 Vercel 环境变量（使用 Render 地址）
5. 部署 Vercel 前端
6. 获得 Vercel 地址
7. **回到 Render**，更新 FRONTEND_URL（使用 Vercel 地址）

### 更新配置

如果需要修改环境变量：
- **Render**：编辑后会自动重新部署
- **Vercel**：需要手动触发重新部署

---

## 常见错误

### ❌ 错误 1：MongoDB 连接失败

**原因：**
- IP 白名单未设置
- 密码错误
- 连接字符串格式错误

**解决：**
1. MongoDB Atlas → Network Access → Allow Access from Anywhere
2. 确认 `<password>` 已替换为实际密码
3. 复制完整的连接字符串

---

### ❌ 错误 2：CORS 错误

**原因：**
- FRONTEND_URL 不正确
- 前端环境变量未设置

**解决：**
1. 确认 Render 的 FRONTEND_URL 包含 Vercel 地址
2. 确认 Vercel 的 VITE_API_URL 包含 Render 地址
3. 两个地址都要带 `https://`

---

### ❌ 错误 3：智谱 API 调用失败

**原因：**
- API Key 错误
- API Key 过期
- 账户余额不足

**解决：**
1. 重新复制 API Key（确保没有空格）
2. 访问智谱控制台查看余额
3. 测试 API Key 是否有效

---

## 安全提示

⚠️ **重要：**
- 不要把 API Key 提交到 GitHub
- 不要分享你的数据库密码
- 不要分享你的 JWT_SECRET
- 定期更换密钥

✅ **最佳实践：**
- 使用环境变量（不要写在代码里）
- 定期检查使用量
- 监控异常访问

---

## 需要帮助？

如果配置过程中遇到问题：
1. 仔细检查每个值是否正确（没有多余空格）
2. 确认配置顺序正确
3. 查看部署日志
4. 参考 CHECKLIST.md 和 DEPLOYMENT_STEP_BY_STEP.md
