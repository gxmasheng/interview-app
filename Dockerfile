FROM node:20-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package文件
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

# 在Docker中安装依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY server/dist ./server/dist/

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口（Railway会设置PORT环境变量）
EXPOSE 3000

# 启动服务
CMD ["node", "server/dist/main.js"]