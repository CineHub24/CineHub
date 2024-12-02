# CineHub

# Lokale Ausführung

### Voraussetzungen
- [**Docker Compose**](https://formulae.brew.sh/formula/docker-compose)
- [**Podman**](https://podman.io/)

### Einrichtung
1. **Repository klonen**
```bash
   git clone https://github.com/CineHub24/CineHub  //Repo Klonen
   cd CineHub

   cp .env.example .env    //env datei anlegen

   npm run db:startWithPodman    // datenbank mit Podman Starten
```

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.