# Single stage build für bessere Übersichtlichkeit
FROM node:18-alpine

WORKDIR /app

# Installiere Build-Abhängigkeiten nur temporär
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++

# Kopiere Paketdateien zuerst
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install --force

# Kopiere den restlichen Code
COPY . .

# Setze Umgebungsvariablen (ersetzt das .env-File)
ENV DATABASE_URL=$DATABASE_URL \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    VITE_GMAIL_USER=$VITE_GMAIL_USER \
    VITE_GMAIL_APP_PASSWORD=$VITE_GMAIL_APP_PASSWORD \
    VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY \
    VITE_OMDB_API_KEY=$VITE_OMDB_API_KEY \
    VITE_SECRET_PAYPAL=$VITE_SECRET_PAYPAL \
    VITE_CLIENT_ID_PAYPAL=$VITE_CLIENT_ID_PAYPAL \
    VITE_PUBLIC_STRIPE_KEY=$VITE_PUBLIC_STRIPE_KEY \
    VITE_SECRET_STRIPE_KEY=$VITE_SECRET_STRIPE_KEY \
    VITE_DOMAIN=$VITE_DOMAIN

# Baue die Anwendung
RUN npm run build

# Entferne Build-Abhängigkeiten
RUN apk del .build-deps

# Behalte nur Produktionsabhängigkeiten
RUN rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/man \
    && rm -rf /tmp/*

EXPOSE 3000

CMD ["node", "build/index.js"]
