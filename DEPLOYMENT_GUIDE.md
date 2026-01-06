
# ReciteAI 部署指南

恭喜你完成了 App 的开发！请按照以下步骤将其部署到公网。

## 第一步：准备服务器与域名

### 1. 购买服务器
*   **推荐平台**：腾讯云 (Tencent Cloud) 或 阿里云 (Aliyun)。
*   **地域选择**：
    *   **方案 A (推荐)**：**中国香港**或**新加坡**。
        *   *优点*：可以直接访问 Google Gemini API，无需配置复杂的代理；无需 ICP 备案，即买即用。
        *   *缺点*：内地访问速度可能稍慢（但在可接受范围内）。
    *   **方案 B**：**中国大陆（北京/上海）**。
        *   *优点*：访问速度极快。
        *   *缺点*：**必须**进行 ICP 备案（耗时 15-30 天）；**无法**直接访问 Gemini API，需要购买一台海外服务器做反向代理，或使用 Cloudflare Worker 中转。

### 2. 购买域名
*   购买一个简短好记的域名，例如 `recite-ai.cn`。
*   如果使用大陆服务器，购买后立即在云控制台申请 **ICP 备案**。

---

## 第二步：后端部署 (Node.js)

1.  **环境安装**：
    SSH 登录你的服务器，安装 Node.js：
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

2.  **上传代码**：
    将 `server-example.js` 和 `package.json` 上传到服务器 `/var/www/recite-backend` 目录。

3.  **配置环境变量**：
    在同目录下创建 `.env` 文件：
    ```env
    PORT=3000
    GOOGLE_API_KEY=你的_Gemini_API_Key
    WX_APP_ID=你的微信AppID
    WX_SECRET=你的微信AppSecret
    ```

4.  **运行服务**：
    使用 PM2 让服务在后台常驻：
    ```bash
    npm install -g pm2
    npm install
    pm2 start server-example.js --name "recite-backend"
    ```

---

## 第三步：前端部署 (React/Vite)

1.  **修改配置**：
    在本地代码中，打开 `config.ts`，将 `API_BASE_URL` 修改为你服务器的 IP 或域名：
    ```typescript
    export const config = {
      API_BASE_URL: 'http://你的服务器IP:3000', 
      // ...
    };
    ```

2.  **构建打包**：
    在本地终端运行：
    ```bash
    npm run build
    ```
    这会生成一个 `dist` 文件夹，里面是纯静态的 HTML/CSS/JS 文件。

3.  **上传文件**：
    将 `dist` 文件夹里的所有内容上传到服务器 `/var/www/recite-frontend`。

4.  **配置 Nginx**：
    安装 Nginx (`sudo apt install nginx`)，并编辑配置文件 `/etc/nginx/sites-available/default`：

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        # 前端静态文件
        location / {
            root /var/www/recite-frontend;
            index index.html;
            try_files $uri $uri/ /index.html; # 处理 React 路由
        }

        # 后端 API 转发
        location /api/ {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

5.  **重启 Nginx**：
    ```bash
    sudo systemctl restart nginx
    ```

---

## 第四步：微信平台配置

1.  前往 [微信开放平台](https://open.weixin.qq.com/)。
2.  在“管理中心” -> “网站应用”中修改 **授权回调域**，填入你的域名（不带 http）。
3.  前往 [微信支付商户平台](https://pay.weixin.qq.com/)，配置 **Native 支付回调链接** 为 `http://你的域名/api/pay/callback`。

## 完成！
现在，用户访问 `http://your-domain.com` 即可使用完整的 ReciteAI 功能。
