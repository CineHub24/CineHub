# Build stage
FROM node:18 AS builder
WORKDIR /app

# Install necessary build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Create the .env file with the build arguments
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

# Debug: Echo raw build args
RUN echo "==== Raw Build Arguments ====" && \
    echo "DATABASE_URL: '${DATABASE_URL}'" && \
    echo "GOOGLE_CLIENT_ID: '${GOOGLE_CLIENT_ID}'" && \
    echo "GOOGLE_CLIENT_SECRET: '${GOOGLE_CLIENT_SECRET}'" && \
    echo "GITHUB_CLIENT_ID: '${GITHUB_CLIENT_ID}'" && \
    echo "GITHUB_CLIENT_SECRET: '${GITHUB_CLIENT_SECRET}'" && \
    echo "VITE_GMAIL_USER: '${VITE_GMAIL_USER}'" && \
    echo "VITE_GMAIL_APP_PASSWORD: '${VITE_GMAIL_APP_PASSWORD}'" && \
    echo "VITE_TMDB_API_KEY: '${VITE_TMDB_API_KEY}'" && \
    echo "VITE_OMDB_API_KEY: '${VITE_OMDB_API_KEY}'" && \
    echo "VITE_SECRET_PAYPAL: '${VITE_SECRET_PAYPAL}'" && \
    echo "VITE_CLIENT_ID_PAYPAL: '${VITE_CLIENT_ID_PAYPAL}'" && \
    echo "VITE_PUBLIC_STRIPE_KEY: '${VITE_PUBLIC_STRIPE_KEY}'" && \
    echo "VITE_SECRET_STRIPE_KEY: '${VITE_SECRET_STRIPE_KEY}'" && \
    echo "VITE_DOMAIN: '${VITE_DOMAIN}'" | sed 's/^/    /'

RUN env


# Write clean environment variables to .env
RUN touch .env && \
    echo "DATABASE_URL='${DATABASE_URL}'" > .env && \
    echo "GOOGLE_CLIENT_ID='${GOOGLE_CLIENT_ID}'" >> .env && \
    echo "GOOGLE_CLIENT_SECRET='${GOOGLE_CLIENT_SECRET}'" >> .env && \
    echo "GITHUB_CLIENT_ID='${GITHUB_CLIENT_ID}'" >> .env && \
    echo "GITHUB_CLIENT_SECRET='${GITHUB_CLIENT_SECRET}'" >> .env && \
    echo "VITE_GMAIL_USER='${VITE_GMAIL_USER}'" >> .env && \
    echo "VITE_GMAIL_APP_PASSWORD='${VITE_GMAIL_APP_PASSWORD}'" >> .env && \
    echo "VITE_TMDB_API_KEY='${VITE_TMDB_API_KEY}'" >> .env && \
    echo "VITE_OMDB_API_KEY='${VITE_OMDB_API_KEY}'" >> .env && \
    echo "VITE_SECRET_PAYPAL='${VITE_SECRET_PAYPAL}'" >> .env && \
    echo "VITE_CLIENT_ID_PAYPAL='${VITE_CLIENT_ID_PAYPAL}'" >> .env && \
    echo "VITE_PUBLIC_STRIPE_KEY='${VITE_PUBLIC_STRIPE_KEY}'" >> .env && \
    echo "VITE_SECRET_STRIPE_KEY='${VITE_SECRET_STRIPE_KEY}'" >> .env && \
    echo "VITE_DOMAIN='${VITE_DOMAIN}'" >> .env

# Debug: Echo final .env contents
RUN echo "==== Final .env file ====" && \
    cat .env | sed 's/^/    /'

# Install architecture-specific rollup package
RUN npm install @rollup/rollup-linux-x64-gnu

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim AS production
WORKDIR /app

# Copy production files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "build/index.js"]
