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

Das Frontend wird in Produktion direkt vom NestJS-Backend serviert (Port 3000).  
**Einstiegspunkt: `http://<server>:3000`**

### Schritte

```bash
# 1. Frontend bauen (generiert API-Client + Vite-Build nach frontend/dist/)
npm run build:frontend

# 2. Backend kompilieren
npm run build

# 3. Starten
npm run start:prod
```

Danach ist die App unter [http://localhost:3000](http://localhost:3000) erreichbar.  
Die REST-API liegt unter `/api/v1/...`, Swagger-Docs unter `/api-docs`.

### Reverse Proxy (nginx)

Die App kann unter einem Unterpfad (z.B. `/hivecards-manager/`) oder direkt als Root betrieben werden.

**nginx-Konfiguration für Unterpfad `/hivecards-manager/`:**

```nginx
server {
    listen 443 ssl;
    server_name olli-home.duckdns.org;

    location /hivecards-manager/ {
        proxy_pass         http://127.0.0.1:3000/hivecards-manager/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # API direkt weiterleiten (kein Subpfad-Prefix)
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

**Backend `.env` Werte:**

```dotenv
SERVE_ROOT=/hivecards-manager
CORS_ORIGIN=https://olli-home.duckdns.org
```

**Frontend `.env.production` Werte** (vor `build:frontend` setzen):

```dotenv
VITE_BASE=/hivecards-manager/
VITE_API_BASE=
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
