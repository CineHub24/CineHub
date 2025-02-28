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


ENV DATABASE_URL="postgres://user:password@localhost:5432/database"
ENV GOOGLE_CLIENT_ID="your-google-client-id"
ENV GOOGLE_CLIENT_SECRET="your-google-client-secret"
ENV GITHUB_CLIENT_ID="your-github-client-id"
ENV GITHUB_CLIENT_SECRET="your-github-client-secret"
ENV VITE_GMAIL_USER="your-gmail-user"
ENV VITE_GMAIL_APP_PASSWORD="your-gmail-app-password"
ENV VITE_TMDB_API_KEY="your-tmdb-api-key"
ENV VITE_OMDB_API_KEY="your-omdb-api-key"
ENV VITE_SECRET_PAYPAL="your-paypal-secret"
ENV VITE_CLIENT_ID_PAYPAL="your-paypal-client-id"
ENV VITE_PUBLIC_STRIPE_KEY="your-stripe-public-key"
ENV VITE_SECRET_STRIPE_KEY="your-stripe-secret-key"
ENV VITE_DOMAIN="your-domain.com"
ENV VITE_PUBLIC_URL="https://your-public-url.com"

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
