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

# Set build arguments
ARG DATABASE_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG VITE_GMAIL_USER
ARG VITE_GMAIL_APP_PASSWORD
ARG VITE_TMDB_API_KEY
ARG VITE_OMDB_API_KEY
ARG VITE_SECRET_PAYPAL
ARG VITE_CLIENT_ID_PAYPAL
ARG VITE_PUBLIC_STRIPE_KEY
ARG VITE_SECRET_STRIPE_KEY
ARG VITE_DOMAIN

# Create .env file in one step
RUN printf "DATABASE_URL='%s'\n\
GOOGLE_CLIENT_ID='%s'\n\
GOOGLE_CLIENT_SECRET='%s'\n\
GITHUB_CLIENT_ID='%s'\n\
GITHUB_CLIENT_SECRET='%s'\n\
VITE_GMAIL_USER='%s'\n\
VITE_GMAIL_APP_PASSWORD='%s'\n\
VITE_TMDB_API_KEY='%s'\n\
VITE_OMDB_API_KEY='%s'\n\
VITE_SECRET_PAYPAL='%s'\n\
VITE_CLIENT_ID_PAYPAL='%s'\n\
VITE_PUBLIC_STRIPE_KEY='%s'\n\
VITE_SECRET_STRIPE_KEY='%s'\n\
VITE_DOMAIN='%s'\n" \
"$DATABASE_URL" \
"$GOOGLE_CLIENT_ID" \
"$GOOGLE_CLIENT_SECRET" \
"$GITHUB_CLIENT_ID" \
"$GITHUB_CLIENT_SECRET" \
"$VITE_GMAIL_USER" \
"$VITE_GMAIL_APP_PASSWORD" \
"$VITE_TMDB_API_KEY" \
"$VITE_OMDB_API_KEY" \
"$VITE_SECRET_PAYPAL" \
"$VITE_CLIENT_ID_PAYPAL" \
"$VITE_PUBLIC_STRIPE_KEY" \
"$VITE_SECRET_STRIPE_KEY" \
"$VITE_DOMAIN" > .env

# Build application
ENV POSTHOG_DISABLED=true
ENV NODE_OPTIONS="--unhandled-rejections=warn"
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
COPY --from=builder /app/.env ./
COPY --from=builder /app/node_modules ./node_modules

# Security hardening
RUN chown -R node:node /app && \
    find /app -type d -exec chmod 755 {} + && \
    find /app -type f -exec chmod 644 {} +

USER node

EXPOSE 3000
CMD ["node", "build/index.js"]
