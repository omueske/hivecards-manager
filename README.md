# Hivecards Manager 🐝

Digitale Stockkarte für Imker — Völker, Königinnen, Durchsichten und Behandlungen verwalten.

---

## Technologie-Stack

| Schicht | Technologie |
|---|---|
| Backend | NestJS + Mongoose (MongoDB) |
| Frontend | Vue 3 + Quasar + Pinia + vue-i18n |
| Authentifizierung | JWT (Bearer Token) |
| Datenbank | MongoDB |

---

## Voraussetzungen

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** (lokal via Docker oder extern)
- **Docker** (optional, für lokale MongoDB)

---

## Installation

### 1. Repository klonen

```bash
git clone <repo-url>
cd hivecards-manager
```

### 2. Backend-Abhängigkeiten installieren

```bash
npm install
```

### 3. Frontend-Abhängigkeiten installieren

```bash
npm --prefix frontend install
```

---

## Konfiguration

Kopiere die Beispiel-Umgebungsdatei und passe sie an:

```bash
cp .env.example .env
```

Inhalt der `.env`:

```dotenv
MONGODB_URI=mongodb://localhost:27017/hivecards
JWT_SECRET=replace_with_a_strong_secret
PORT=3000
```

| Variable | Beschreibung |
|---|---|
| `MONGODB_URI` | Verbindungs-URI zur MongoDB-Instanz |
| `JWT_SECRET` | Geheimer Schlüssel für JWT-Signierung (sicher wählen!) |
| `PORT` | Port des Backend-Servers (Standard: `3000`) |

---

## Entwicklungsumgebung starten

### MongoDB via Docker starten (lokal)

```bash
docker compose up -d
```

### Backend starten

```bash
npm run dev
```

Der Backend-Server läuft dann auf [http://localhost:3000](http://localhost:3000).

### Frontend starten

In einem zweiten Terminal:

```bash
npm --prefix frontend run dev
```

Das Frontend ist dann unter [http://localhost:5173](http://localhost:5173) erreichbar.

---

## Produktion / Build

### Frontend bauen

```bash
npm run build:frontend
```

Generiert den API-Client aus `doc/openapi.yaml` und baut anschließend das Frontend nach `frontend/dist/`.

### Backend bauen & starten

```bash
npm run build
npm run start:prod
```

---

## API-Client generieren

Der TypeScript-Client im Frontend wird aus der OpenAPI-Spec generiert:

```bash
npm run generate:client
```

---

## Projektstruktur

```
hivecards-manager/
├── src/                        # NestJS Backend
│   ├── auth/                   # JWT-Authentifizierung (Login/Register)
│   ├── hives/                  # Völker (CRUD)
│   ├── queens/                 # Königinnen (CRUD + Zuweisungshistorie)
│   ├── inspections/            # Durchsichten & Behandlungen
│   ├── apiaries/               # Standorte
│   └── main.ts                 # Einstiegspunkt
├── frontend/
│   └── src/
│       ├── api-client/         # Generierter TypeScript-API-Client
│       ├── auth/               # Token-Verwaltung (localStorage)
│       ├── components/         # Vue-Komponenten (Dialoge etc.)
│       ├── pages/              # Seiten (Dashboard, Hives, Queens …)
│       ├── stores/             # Pinia-Stores
│       ├── router/             # Vue Router
│       └── locales/            # i18n (de, en)
├── doc/                        # Dokumentation & OpenAPI-Spec
├── docker-compose.yml          # MongoDB für lokale Entwicklung
└── .env.example                # Vorlage für Umgebungsvariablen
```

---

## Wichtige Routen (Backend)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Benutzer registrieren |
| `POST` | `/api/v1/auth/login` | Anmelden, JWT erhalten |
| `GET` | `/api/v1/hives` | Alle Völker des Nutzers |
| `POST` | `/api/v1/hives` | Neues Volk anlegen |
| `GET` | `/api/v1/queens` | Alle Königinnen (optional `?hiveId=`) |
| `POST` | `/api/v1/queens/:id/assign` | Königin einem Volk zuweisen |
| `POST` | `/api/v1/queens/:id/remove-from-hive` | Königin aus Volk entfernen |
| `GET` | `/api/v1/inspections` | Durchsichten/Behandlungen |
| `GET` | `/api/v1/apiaries` | Standorte |

Alle Routen (außer Auth) erfordern den Header `Authorization: Bearer <token>`.

---

## Erste Schritte in der App

1. **Registrieren** → Konto anlegen
2. **Standort anlegen** → Apiarien-Seite
3. **Volk anlegen** → Völker-Seite, Standort zuweisen
4. **Königin anlegen** → Königinnen-Seite, dann dem Volk zuweisen
5. **Durchsichten erfassen** → Volk anklicken → Stockkarte öffnen
