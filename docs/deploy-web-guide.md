# Web 部署指南

## 一、部署架构

```
用户浏览器 → 前端静态文件 (dist-web/) → 后端API服务
```

## 二、部署方式选择

### 方式一：云服务器部署（推荐）

需要一台云服务器（如阿里云ECS、腾讯云CVM），安装 Node.js 和 Nginx。

#### 步骤：

**1. 上传文件到服务器**

```bash
# 上传前端静态文件
scp -r dist-web/* user@your-server:/var/www/html/

# 上传后端服务
scp -r server/dist/* user@your-server:/opt/server/
scp -r server/node_modules user@your-server:/opt/server/
scp server/package.json user@your-server:/opt/server/
```

**2. 配置 Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**3. 启动后端服务**

```bash
cd /opt/server
node main.js
```

---

### 方式二：静态托管 + 后端独立部署

将前端托管到静态存储服务（如阿里云OSS、腾讯云COS），后端部署到云服务器。

#### 前端部署到阿里云OSS：

1. 登录阿里云OSS控制台
2. 创建Bucket，设置为静态网站托管模式
3. 上传 `dist-web/` 目录下所有文件
4. 设置默认首页为 `index.html`
5. 配置域名（如 app.your-domain.com）

#### 后端部署：

同方式一的步骤2-3，但需要修改前端的API请求地址。

修改前端配置，将 `PROJECT_DOMAIN` 设置为后端域名：

```typescript
// src/config/app.config.ts
export const PROJECT_DOMAIN = 'https://api.your-domain.com'
```

---

### 方式三：Docker 部署

#### Dockerfile（前端 + 后端一体）：

```dockerfile
FROM node:18-alpine

# 安装 Nginx
RUN apk add nginx

# 复制前端文件
COPY dist-web /var/www/html

# 复制后端文件
COPY server/dist /opt/server
COPY server/node_modules /opt/server
COPY server/package.json /opt/server

# 配置 Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# 启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
```

#### start.sh：

```bash
#!/bin/sh
nginx
cd /opt/server && node main.js
```

---

## 三、环境变量配置

部署前需配置以下环境变量：

```bash
# Supabase 数据库配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# 项目域名（用于前端访问后端）
PROJECT_DOMAIN=https://your-domain.com
```

---

## 四、注意事项

1. **HTTPS 配置**：生产环境必须配置 HTTPS，可以使用 Let's Encrypt免费证书
2. **跨域问题**：前端和后端部署在同一域名下可避免跨域，否则需配置 CORS
3. **端口开放**：确保服务器防火墙开放80/443端口（前端）和3000端口（后端，如需直接访问）
4. **数据库连接**：确保服务器能访问 Supabase 数据库

---

## 五、快速测试部署

本地测试生产版本：

```bash
# 启动后端
cd server && node dist/main.js

# 前端用任意静态服务器托管
npx serve dist-web
```