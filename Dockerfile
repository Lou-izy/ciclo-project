FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY patches/ patches/
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000 5173