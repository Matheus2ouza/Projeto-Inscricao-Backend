# Stage 1 - Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Stage 2 - Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
# Generate Prisma client
RUN npx prisma generate
RUN npm run build

# Stage 3 - Production
FROM gcr.io/distroless/nodejs18-debian12:nonroot AS production
WORKDIR /app

# Copy only production dependencies
COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
# Copy built application
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
# Copy generated Prisma client
COPY --from=builder --chown=nonroot:nonroot /app/generated ./generated
# Copy package.json for runtime info
COPY --chown=nonroot:nonroot package*.json ./

# Run the application
CMD ["dist/main.js"]
