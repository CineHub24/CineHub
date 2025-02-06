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

# Pipeline
(do we want to explain the workflows in greater detail here?)
