# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy application code
COPY . .

# Build application
ENV POSTHOG_DISABLED=true
ENV NODE_OPTIONS="--unhandled-rejections=warn"


ENV DATABASE_URL="postgres://postgres:yourpassword@cinehub_db:5432/cinehub"
ENV GOOGLE_CLIENT_ID=""
ENV GOOGLE_CLIENT_SECRET=""
ENV GITHUB_CLIENT_ID=""
ENV GITHUB_CLIENT_SECRET=""
ENV VITE_GMAIL_USER=""
ENV VITE_GMAIL_APP_PASSWORD=""
ENV VITE_TMDB_API_KEY=""
ENV VITE_OMDB_API_KEY=""
ENV VITE_SECRET_PAYPAL=""
ENV VITE_CLIENT_ID_PAYPAL=""
ENV VITE_PUBLIC_STRIPE_KEY=""
ENV VITE_SECRET_STRIPE_KEY=""
ENV VITE_DOMAIN=""
ENV VITE_PUBLIC_URL=""

RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Copy production artifacts
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Security hardening
RUN chown -R node:node /app && \
    find /app -type d -exec chmod 755 {} + && \
    find /app -type f -exec chmod 644 {} +

USER node

EXPOSE 3000
CMD ["node", "build/index.js"]
