# CineHub
- Production System: https://cinehub.tech
-  Test Suite: [https://cinehub24.github.io/CineHub/](https://cinehub24.github.io/CineHub/)

# Local Setup

### Requirements

- [**Docker Compose**](https://formulae.brew.sh/formula/docker-compose)
- [**Podman**](https://podman.io/)

### Setup

1. **Cloning the repository**

```bash
   git clone https://github.com/CineHub24/CineHub
```
2. **Setting up the database**
```bash
   cd CineHub
   npm i

   npm run db:startWithPodman
```

3. **Running the application**
```bash
npm run dev
# passing --open will additionally open the app in your default browser
npm run dev -- --open
```

### Building

To create a production version of the app, you need to execute the following command:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

### Other helpful commands
#### Database Administration
The command
```bash
npm run db:studio
```
will start Drizzle Studio, which is a webpage that provides a user interface for  viewing and editing the database instance.

#### Tests
- Unit Tests: `npm run test:unit` / `npm run test:unit:coverage`
- End-to-end Tests: `npm run test:e2e`
- All tests: `npm run test`

# Project Overview (Shortened)

```
.
├── .github/workflows/
│   ├── apply_schema_migrations.yml # automated ORM migrations
│   ├── build_image.yml # Deployment to a VPS
│   └── run_tests.yml # unit tests
├── e2e/ # End-to-end tests
├── messages/ # Defined strings for language awareness
│   ├── de.json
│   └── en.json
├── src/
│   ├── lib/
│   │   ├── components # Reusable components are stored here
│   │   ├── paraglide # Lib used for language awareness
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   └── schema.ts # Database schema
│   │   │   ├── auth.ts # Session- and authentication-handling
│   │   │   └── sse.ts # Server-sent events, used in seat picker
│   │   ├── stores
│   │   └── utils
│   ├── paraglide # Generated based on /messages
│   ├── routes/ # Includes all pages
│   ├── app.html
│   └── hooks.server.ts # includes auth and other preliminaries of requests
├── static/ # Static files like images
├── .env
├── Dockerfile
├── drizzle.config.ts # ORM configuration
├── package.json # includes a list of useful scripts
└── playwright.config.ts # E2E test config
```

-> The coding of all pages can be found under [/src/routes](https://github.com/CineHub24/CineHub/tree/main/src/routes)

# Pipelines
## CI/CD Pipelines

### Docker Build and Push Workflow

Dieser Workflow wird ausgeführt bei:
- Push auf den `main` Branch
- Pull Requests zum `main` Branch

#### Schritte:
1. Code auschecken
2. Docker Buildx einrichten
3. Anmeldung bei GitHub Container Registry
4. Docker Image bauen und pushen

#### Konfiguration:
- Plattformen: `linux/amd64`, `linux/arm64`
- Registry: `ghcr.io/cinehub24/cinehub:latest`
- Build-Argumente werden als Secrets übergeben

### Schema-Migrationen Workflow

Wird ausgeführt bei Push auf den `main` Branch:
- Installiert Abhängigkeiten
- Generiert Datenbank-Migrationen
- Wendet Migrationen an

### Test Workflow

Wird ausgeführt bei:
- Pull Requests zum `main` Branch
- Pushes auf den `main` Branch

#### Schritte:
1. Code auschecken
2. Node.js einrichten
3. Abhängigkeiten installieren
4. Unit-Tests ausführen
5. Coverage-Bericht generieren
6. Coverage-Bericht auf GitHub Pages veröffentlichen



# Komponenten und Dependencies

### Haupttechnologien
- SvelteKit
- TypeScript
- Vite
- Drizzle ORM
- Tailwind CSS

### Entwicklungs-Dependencies
- Testing: Vitest, Playwright
- Linting: ESLint, Prettier
- Build-Tools: Vite, SvelteKit

### Zentrale Pakete

#### Frontend
- Svelte 5.0
- Tailwind CSS
- Lucide Icons
- D3.js (Visualisierung)

#### Authentifizierung
- Arctic (OAuth)
- Argon2 (Passwort-Hashing)
- js-cookie

#### Zahlungsintegration
- Stripe
- PayPal

#### Zusätzliche Funktionen
- QR-Code Generation
- PDF-Generierung
- Internationalisierung (Paraglide)
- Email-Versand (Nodemailer)
