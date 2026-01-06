
/**
 * RECITE AI - BACKEND SERVER BOILERPLATE
 * 
 * 这是一个 Node.js (Express) 后端模版。
 * 部署步骤：
 * 1. 安装依赖: npm install express cors body-parser axios dotenv
 * 2. 创建 .env 文件并填入 API Keys
 * 3. 运行: node server-example.js
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // 需要安装 dotenv: npm install dotenv

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // 支持大图片上传

// 模拟数据库
const USERS_DB = {}; 

// ==========================================
// 1. 核心功能：Gemini API 代理 (解决国内访问问题)
// ==========================================
app.post('/api/gemini/proxy', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    
    // 这里的 API Key 存储在服务器端，不会暴露给前端，安全！
    const apiKey = process.env.GOOGLE_API_KEY; 

    // 转发请求到 Google
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents,
        generationConfig: config
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60s timeout
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Gemini Proxy Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI Service Unavailable" });
  }
});

// ==========================================
// 2. 用户认证 (微信登录逻辑)
// ==========================================
app.post('/api/auth/wechat', async (req, res) => {
  const { code } = req.body;
  
  // 真实逻辑：拿着前端给的临时 code，去微信服务器换取 openid 和 session_key
  /*
  const wxRes = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_APP_ID}&secret=${process.env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`);
  const { openid } = wxRes.data;
  */
  
  // 模拟逻辑
  const openid = `wx_${Math.random().toString(36).substr(2, 9)}`;
  
  // 查找或创建用户
  let user = USERS_DB[openid];
  if (!user) {
    user = {
      id: openid,
      name: `微信用户_${openid.slice(-4)}`,
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=wx',
      isPro: false,
      createdAt: new Date()
    };
    USERS_DB[openid] = user;
  }

  // 返回用户信息 (真实项目中应该返回 JWT Token)
  res.json({ user, token: 'mock_jwt_token' });
});

// ==========================================
// 3. 支付系统 (微信支付)
// ==========================================
app.post('/api/pay/create-order', async (req, res) => {
  const { userId, planId } = req.body;
  
  console.log(`Creating order for User ${userId}, Plan ${planId}`);

  // 真实逻辑：调用微信统一下单接口 (UnifiedOrder)
  // const wxPayParams = await wechatPayClient.transactions.native(...)

  // 模拟返回二维码链接
  res.json({
    orderId: `ord_${Date.now()}`,
    qrCodeUrl: "weixin://wxpay/bizpayurl?pr=MockUrl" // 前端将此 URL 转为二维码展示
  });
});

app.post('/api/pay/callback', (req, res) => {
  // 微信支付成功后的回调接口
  // 1. 验签
  // 2. 更新数据库 USERS_DB[userId].isPro = true;
  res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
});

// ==========================================
// 启动服务器
// ==========================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`- Gemini Proxy: /api/gemini/proxy`);
  console.log(`- Auth: /api/auth/wechat`);
});
