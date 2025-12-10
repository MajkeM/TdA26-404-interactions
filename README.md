# Think different Academy - guunrs

## 👥 Tým

**Název týmu:** guunrs

| Člen | Role |
|------|------|
| Matyáš Odehnal | Project Manager, Main Developer |
| Vojta Novák | Developer |
| Jirka Maštera | Developer |

## 🛠️ Použité technologie

### Backend
- **Node.js** (v20) - runtime prostředí
- **Express.js** (v4.21) - webový framework
- **better-sqlite3** - SQLite databáze
- **EJS** - šablonovací engine pro server-side rendering
- **express-session** - správa sessions pro autentizaci
- **multer** - upload souborů
- **uuid** - generování unikátních identifikátorů

### Frontend
- **HTML5 / CSS3** - struktura a stylování
- **Vanilla JavaScript** - interaktivita
- **Responzivní design** - podpora mobilů, tabletů i desktopů

### Deployment
- **Docker** - kontejnerizace aplikace
- **Tour de Cloud** - hosting platformy

## 🚀 Spuštění aplikace

### Lokální vývoj

```bash
# Přejít do složky serveru
cd apps/server

# Instalace závislostí
npm install

# Spuštění serveru
npm start
```

Server běží na `http://localhost:3000`

### Docker

```bash
# Build image
docker build -t tda-guunrs ./apps/server

# Spuštění kontejneru
docker run -p 3000:3000 tda-guunrs
```

### Nasazení na Tour de Cloud

Aplikace se automaticky nasazuje při push do `main` branch na GitHubu.

**Doba nasazení:** cca 2-3 minuty

## 📋 Funkce aplikace

### Veřejná část
- **Domovská stránka** s přehledem platformy
- **Seznam kurzů** s možností vyhledávání
- **Detail kurzu** se studijními materiály a kvízy
- **Interaktivní kvízy** s okamžitým vyhodnocením

### Administrace (Dashboard)
- **Přihlášení:** `lecturer` / `TdA26!`
- Správa kurzů (CRUD operace)
- Správa studijních materiálů (soubory a odkazy)
- Správa kvízů s otázkami různých typů
- Přehled výsledků kvízů

## 🎨 Design

Aplikace dodržuje brandmanuál Think different Academy:
- Barevná paleta podle brandmanuálu
- Responzivní layout pro všechna zařízení
- Moderní a přehledné uživatelské rozhraní

## 📁 Struktura projektu

```
TdA26-guunrs/
├── apps/
│   └── server/
│       ├── server.js          # Hlavní soubor aplikace
│       ├── package.json       # Závislosti
│       ├── Dockerfile         # Docker konfigurace
│       ├── views/             # EJS šablony
│       │   ├── home.ejs
│       │   ├── courses.ejs
│       │   ├── course-detail.ejs
│       │   ├── login.ejs
│       │   ├── dashboard.ejs
│       │   └── dashboard-course.ejs
│       └── uploads/           # Nahrané soubory
├── tourdeapp.yaml             # Konfigurace pro Tour de Cloud
└── README.md
```

## 🔗 API Endpointy

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/api` | Info o organizaci |
| GET | `/api/courses` | Seznam kurzů |
| POST | `/api/courses` | Vytvoření kurzu |
| GET | `/api/courses/:uuid` | Detail kurzu |
| PUT | `/api/courses/:uuid` | Úprava kurzu |
| DELETE | `/api/courses/:uuid` | Smazání kurzu |
| GET | `/api/courses/:uuid/materials` | Materiály kurzu |
| POST | `/api/courses/:uuid/materials` | Přidání materiálu |
| GET | `/api/courses/:uuid/quizzes` | Kvízy kurzu |
| POST | `/api/courses/:uuid/quizzes` | Vytvoření kvízu |
| POST | `/api/courses/:uuid/quizzes/:quizId/submit` | Odeslání odpovědí |

## 📝 Poznámky

- Databáze SQLite se vytváří automaticky při prvním spuštění
- Při prvním spuštění se vytvoří ukázkové kurzy
- Nahrané soubory jsou uloženy ve složce `uploads/`
- Maximální velikost nahrávaného souboru: 30 MB

---

*Tour de App 2026 - Student Cyber Games*
