#!/bin/bash
# 上岸吧公考面试小程序一键部署脚本
#适用于 Ubuntu/Debian 云服务器

echo "=========================================="
echo "上岸吧公考面试小程序部署脚本"
echo "=========================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo "请使用 root 用户或 sudo 执行此脚本"
  exit 1
fi

# 安装Node.js
echo ">>> 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装 Nginx
echo ">>> 安装 Nginx..."
apt-get install -y nginx

# 安装 PM2（进程管理）
echo ">>> 安装 PM2..."
npm install -g pm2

# 创建目录
echo ">>> 创建部署目录..."
mkdir -p /var/www/shang-an
mkdir -p /opt/shang-an-server

# 配置 Nginx
echo ">>> 配置 Nginx..."
cat > /etc/nginx/sites-available/shang-an << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    root /var/www/shang-an;
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
EOF

ln -sf /etc/nginx/sites-available/shang-an /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 重启 Nginx
systemctl restart nginx

echo "=========================================="
echo "部署环境已准备完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 上传前端文件到 /var/www/shang-an/"
echo "2. 上传后端文件到 /opt/shang-an-server/"
echo "3. 配置环境变量："
echo "   export COZE_SUPABASE_URL=your-url"
echo "   export COZE_SUPABASE_ANON_KEY=your-key"
echo "4. 启动后端服务："
echo "   cd /opt/shang-an-server && pm2 start main.js"
echo "5. 访问 http://服务器IP 测试"
echo ""
echo "如需配置域名和HTTPS，请参考 docs/deploy-web-guide.md"