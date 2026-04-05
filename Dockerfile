# Stage 1 - Dependencies
FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2 - Build
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN node --max-old-space-size=4096 node_modules/.bin/nest build api && node --max-old-space-size=4096 node_modules/.bin/nest build worker

# Stage 3 - Production
FROM node:20-bullseye-slim
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

CMD ["node", "dist/main.js"]
