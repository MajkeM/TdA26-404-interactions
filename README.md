# Tour de App - React + Express Boilerplate

> **Note:** Czech version is available below / Česká verze je k dispozici níže

A template for developing applications for the Tour de App competition with a frontend in [React](https://react.dev/) and a backend in [Express](https://expressjs.com/).

## Initial Setup

In the frontend and backend directories, there are `.env.example` files that need to be renamed to `.env` and the values adjusted as needed.

For production development, you need to set `VITE_API_URL` to the API server URL in the `tourdeapp.yaml` file to the URL you find on the main page of your project on [tourde.cloud](https://tourde.cloud/).

> [!WARNING]
> If you want to change the database password, you need to change it in the `tourdeapp.yaml` file, `apps/server/.env`, and for local development in the `apps/server/package.json` file.

## Local Development

For local development, you need to run:
- **frontend** (`apps/web`), using `npm run dev` (in the correct directory - `apps/web`), it will start at [http://localhost:3001](http://localhost:3001)
- **backend** (`apps/server`), using `npm run dev` (in the correct directory - `apps/server`), it will start at [http://localhost:3000](http://localhost:3000)
- **MySQL** database, which is defined in `docker-compose.yaml`, using `npm run db` (in the `apps/server` directory), the database will run on port 3306

> [!WARNING]
> The database is not persistent, data will be lost after shutting down the Docker container.

## Production Setup (how does it run on our servers?)

How the application runs on [tourde.cloud](https://tourde.cloud/) is defined in the `tourdeapp.yaml` file in the root directory of this repository. This boilerplate includes pre-configured services:
```
- caddy (reverse proxy for frontend and backend) - handles routing requests to your application to the correct place (i.e., /* to frontend and /api/* to backend)
- web (frontend application)
- server (backend application)
- mysql (MySQL database)
```

> [!WARNING]
> The database is not persistent, data will be lost after uploading a new version of the application.

> [!NOTE]
> The reverse proxy is set by default so that requests to `/*` go to the frontend and `/api/*` to the backend. If you want to have the API on different addresses, you need to change the `Caddyfile` file in the `apps/caddy` directory.

What `tourdeapp.yaml` can contain is described in [How to deploy an app to Tour de Cloud](https://tourdeapp.com/study-materials/how-to-deploy).

Applications are uploaded to Tour de Cloud via [GitHub action](https://github.com/Student-Cyber-Games/upload-app?tab=readme-ov-file). For uploading, you need to set **TDC_TOKEN**:
- Settings -> (Security) Secrets and variables -> Actions -> New repository secret.
- Name: `TDC_TOKEN` Secret: [your secret generated in [tourde.cloud](https://tourde.cloud/)]


### Prerequisites

#### Windows

- Installed [WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install)
- Installed and running [Docker](https://www.docker.com/)
- Installed [Node.js](https://nodejs.org/en/download/)
- Installed [npm](https://www.npmjs.com/get-npm) (usually included with Node.js)

#### Linux / MacOS

- Installed and running [Docker](https://www.docker.com/)
- Installed [Node.js](https://nodejs.org/en/download/)
- Installed [npm](https://www.npmjs.com/get-npm) (usually included with Node.js)

## Submission

How to submit your application can be found in our [How to deploy an app to Tour de Cloud](https://tourdeapp.com/study-materials/how-to-deploy)

---

# Tour de App - React + Express Boilerplate

**Česká verze / Czech Version**

Šablona pro vývoj aplikace v soutěži Tour de App společně s frontendovou částí ve frameworku [React](https://react.dev/) a backendovou částí v [Express](https://expressjs.com/).

## Prvotní nastavení

V složkách pro frontend a backend jsou `.env.example` soubory, které je potřeba přejmenovat na `.env` a upravit hodnoty dle potřeby.

Pro produkční vývoj je potřeba nastavit `VITE_API_URL` na URL API serveru v souboru `tourdeapp.yaml` na URL, kterou najdete na hlavní stránce Vašeho projektu na [tourde.cloud](https://tourde.cloud/).

> [!WARNING]
> Pokud chcete měnit heslo od databáze, je potřeba ho změnit v souboru `tourdeapp.yaml`, `apps/server/.env` a pro lokální vývoj v souboru `apps/server/package.json`.

## Lokální vývoj

Pro lokální vývoj je potřeba pustit:
- **frontend** (`apps/web`), pomocí `npm run dev` (ve správném adresáři - `apps/web`), pustí se na [http://localhost:3001](http://localhost:3001)
- **backend** (`apps/server`), pomocí `npm run dev` (ve správném adresáři - `apps/server`), pustí se na [http://localhost:3000](http://localhost:3000)
- **MySQL** databázi, která je definována v `docker-compose.yaml`, pomocí `npm run db` (v adresáři `apps/server`), databáze poběží na portu 3306

> [!WARNING]
> Databáze není perzistentní, data se z ní po vypnutí Docker kontejneru ztratí.

## Produkční setup (jak se to spouští na našich serverech?)

Jak se aplikace spustí na [tourde.cloud](https://tourde.cloud/) je definováno v souboru `tourdeapp.yaml` v kořenovém adresáři tohoto repozitáře. V tomto boilerplate jsou předpřipravené služby:
```
- caddy (reverse proxy pro frontend a backend) - stará se o to, aby dotazy na Vaší aplikaci byly směrovány na správné místo (tj. /* na frontend a /api/* na backend)
- web (frontend aplikace)
- server (backend aplikace)
- mysql (MySQL databáze)
```

> [!WARNING]
> Databáze není perzistentní, data se z ní po nahrání nové verze aplikace ztratí.

> [!NOTE]
> Reverse proxy je defaultně nastaven tak, že dotazy na `/*` jdou na frontend a `/api/*` na backend. Pokud byste chtěli API mít na jiných adresách, je nutné změnit soubor `Caddyfile` v adresáři `apps/caddy`.

Co může `tourdeapp.yaml` obsahovat je napsáno v [Jak nasadit aplikaci na Tour de Cloud](https://tourdeapp.cz/vzdelavaci-materialy/jak-deploy).

Do Tour de Cloud se aplikace nahrávají přes [GitHub action](https://github.com/Student-Cyber-Games/upload-app?tab=readme-ov-file). Pro nahrání je potřeba zadat **TDC_TOKEN**:
- Settings -> (Security) Secrets and variables -> Actions -> New repository secret.
- Name: `TDC_TOKEN` Secret: [váš secret vygenerovaný v [tourde.cloud](https://tourde.cloud/)]


### Prerekvizity

#### Windows

- Nainstalovaný [WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install)
- Nainstalovaný a běžící [Docker](https://www.docker.com/)
- Nainstalovaný [Node.js](https://nodejs.org/en/download/)
- Nainstalovaný [npm](https://www.npmjs.com/get-npm) (bývá součástí Node.js)

#### Linux / MacOS

- Nainstalovaný a běžící [Docker](https://www.docker.com/)
- Nainstalovaný [Node.js](https://nodejs.org/en/download/)
- Nainstalovaný [npm](https://www.npmjs.com/get-npm) (bývá součástí Node.js)

## Odevzdání

Jak odevzdat svoji aplikaci můžete najít v našich [Jak nasadit aplikaci na Tour de Cloud](https://tourdeapp.cz/vzdelavaci-materialy/jak-deploy)
