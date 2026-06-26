# Railway完整部署指南

## 前言

Railway是一个免费的云端托管平台，提供：
- 每月500小时免费额度
- PostgreSQL数据库
- 自动部署和持续集成
- 简单的环境变量管理

## 步骤一：创建GitHub仓库

### 1. 下载项目文件
从本平台下载打包文件：`railway-deploy.tar.gz`

### 2. 解压并上传到GitHub
```bash
# 解压文件
tar -xzvf railway-deploy.tar.gz

# 创建GitHub仓库
# 登录 github.com，创建新仓库，如：interview-app

# 上传代码
git init
git add .
git commit -m "Initial commit: 公务员面试训练小程序"
git branch -M main
git remote add origin https://github.com/你的用户名/interview-app.git
git push -u origin main
```

## 步骤二：注册Railway

### 1. 访问Railway官网
- 地址：https://railway.app/
- 使用GitHub账号登录（推荐）

### 2. 确认账号
- Railway会自动关联你的GitHub账号
- 免费额度：每月500小时

## 步骤三：创建项目

### 1. 新建项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择你的 `interview-app` 仓库

### 2. 添加PostgreSQL数据库
- 在项目中点击 "Add Service"
- 选择 "Database" → "PostgreSQL"
- Railway会自动创建数据库并注入环境变量

## 步骤四：配置环境变量

### 1. 打开项目变量设置
- 点击项目名称进入项目页面
- 点击 "Variables" 标签

### 2. 添加以下环境变量（从Supabase获取）

```
COZE_SUPABASE_URL = https://你的项目ID.supabase.co
COZE_SUPABASE_ANON_KEY = eyJ你的完整密钥
COZE_BOT_TOKEN = 你的Bot Token
COZE_API_BASE = https://api.coze.cn
NODE_ENV = production
```

### 3. 获取Supabase变量
- 登录 https://supabase.com/dashboard
- 选择你的项目
- Settings → API → 复制：
  - Project URL → `COZE_SUPABASE_URL`
  - anon public key → `COZE_SUPABASE_ANON_KEY`

## 步骤五：部署

### 1. Railway自动检测项目
Railway会自动识别Nixpacks配置：
- Node.js 18
- 自动安装依赖
- 构建并启动服务

### 2. 等待部署完成
- 查看部署日志
- 等待 "Deploy successful" 提示

### 3. 获取访问地址
- Railway会分配一个域名，如：
  `https://interview-app-production.up.railway.app`

## 步骤六：验证部署

### 1. 测试API接口
在浏览器访问：
```
https://你的域名/api/questions
```
应该返回题库JSON数据

### 2. 测试完整应用
访问前端页面：
```
https://你的域名/
```

## 步骤七：绑定自定义域名（可选）

### 1. 在Railway设置域名
- Settings → Domains
- 添加你的域名

### 2. 配置DNS
在你的域名服务商添加CNAME记录：
```
CNAME 你的子域名 → 你的Railway域名
```

## 常见问题解决

### 问题1：部署失败
检查Railway日志，常见原因：
- 环境变量未配置
- PostgreSQL未创建
- 依赖安装失败

### 问题2：API返回500错误
检查环境变量是否正确：
- Supabase URL格式是否完整
- Supabase密钥是否完整
- Bot Token是否有效

### 问题3：数据库连接失败
确认PostgreSQL服务已创建：
- Railway会自动注入数据库变量
- 数据库变量会自动添加到服务

## 部署成功后

### 访问地址
Railway提供的访问地址可以：
- 直接在浏览器打开（H5页面）
- 分享给用户试用
- 用于测试和验证

### 后续优化
- 绑定自定义域名
- 添加微信小程序
- 扩展题库内容
- 优化评分逻辑

## 资源限制

Railway免费额度：
- 每月500小时（足够测试使用）
- 1GB数据库存储
- 1GB内存
- 自动休眠（长时间不访问）

如果超出免费额度，可以：
- 升级到付费计划（$5/月起）
- 迁移到其他云服务器