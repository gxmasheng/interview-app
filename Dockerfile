FROM node:20-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制根目录package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# 复制server目录
COPY server/package.json ./server/
COPY server/dist ./server/dist/
COPY server/node_modules ./server/node_modules/

# 安装生产依赖
RUN cd server && pnpm install --prod --frozen-lockfile

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "server/dist/main.js"]