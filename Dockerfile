# Build stage
FROM --platform=linux/amd64 node:18 AS builder
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

# Debug DATABASE_URL
RUN echo "Original DATABASE_URL: $DATABASE_URL" && \
    cleaned_url=$(echo "$DATABASE_URL" | tr -d '"' | tr -d "'" | xargs) && \
    echo "Cleaned DATABASE_URL: $cleaned_url" && \
    echo "DATABASE_URL=$cleaned_url" > .env

# Write other environment variables to .env
RUN echo "GOOGLE_CLIENT_ID=$(echo $GOOGLE_CLIENT_ID | tr -d '"' | xargs)" >> .env && \
    echo "GOOGLE_CLIENT_SECRET=$(echo $GOOGLE_CLIENT_SECRET | tr -d '"' | xargs)" >> .env && \
    echo "GITHUB_CLIENT_ID=$(echo $GITHUB_CLIENT_ID | tr -d '"' | xargs)" >> .env && \
    echo "GITHUB_CLIENT_SECRET=$(echo $GITHUB_CLIENT_SECRET | tr -d '"' | xargs)" >> .env && \
    echo "VITE_GMAIL_USER=$(echo $VITE_GMAIL_USER | tr -d '"' | xargs)" >> .env && \
    echo "VITE_GMAIL_APP_PASSWORD=$(echo $VITE_GMAIL_APP_PASSWORD | tr -d '"' | xargs)" >> .env && \
    echo "VITE_TMDB_API_KEY=$(echo $VITE_TMDB_API_KEY | tr -d '"' | xargs)" >> .env && \
    echo "VITE_OMDB_API_KEY=$(echo $VITE_OMDB_API_KEY | tr -d '"' | xargs)" >> .env && \
    echo "VITE_SECRET_PAYPAL=$(echo $VITE_SECRET_PAYPAL | tr -d '"' | xargs)" >> .env && \
    echo "VITE_CLIENT_ID_PAYPAL=$(echo $VITE_CLIENT_ID_PAYPAL | tr -d '"' | xargs)" >> .env && \
    echo "VITE_PUBLIC_STRIPE_KEY=$(echo $VITE_PUBLIC_STRIPE_KEY | tr -d '"' | xargs)" >> .env && \
    echo "VITE_SECRET_STRIPE_KEY=$(echo $VITE_SECRET_STRIPE_KEY | tr -d '"' | xargs)" >> .env && \
    echo "VITE_DOMAIN=$(echo $VITE_DOMAIN | tr -d '"' | xargs)" >> .env

# Display final .env file (excluding sensitive data)
RUN echo "Final .env file:" && \
    cat .env | grep -v "_SECRET" | grep -v "PASSWORD" | grep -v "KEY"

# Install architecture-specific rollup package
RUN npm install @rollup/rollup-linux-x64-gnu

# Build the application
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:18-slim AS production
WORKDIR /app

# Copy production files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "build/index.js"]