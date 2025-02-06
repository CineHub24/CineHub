# CineHub
cinehub.tech

# Test Suite

[https://cinehub24.github.io/CineHub/](https://cinehub24.github.io/CineHub/)

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

   npm i

   npm run db:startWithPodman    // datenbank mit Podman Starten
```

## Developing/Run App

```bash
npm i
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
