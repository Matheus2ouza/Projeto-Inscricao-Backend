# Stage 1 - Dependencies
FROM node:18-bullseye-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2 - Build
FROM node:18-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3 - Production
FROM gcr.io/distroless/nodejs18-debian12:nonroot
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY package*.json ./

CMD ["dist/main.js"]
