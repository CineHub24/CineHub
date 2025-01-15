# Build stage
FROM --platform=linux/amd64 node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:18-slim
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
RUN npm ci --only=production && \
    npm cache clean --force
CMD ["node", "build/index.js"]