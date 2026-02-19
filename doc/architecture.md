# Architektur-Blueprint — Hivecards Manager (Starter)

Kurz: Stack bestätigt: Vue 3 + Quasar (PWA, Mobile via Capacitor/Quasar), API-first Backend, PostgreSQL, Docker, CI/CD.

## 1. Ziele
- Schnelles MVP für Web + installierbare PWA
- Max. Code‑Reuse für Mobile (Quasar/Capacitor)
- Offline‑Fähigkeit + deterministische Sync‑Strategie

## 2. Empfohlener Starter‑Stack
- Frontend: Vue 3, TypeScript, Quasar Framework, Vite
- State: Pinia
- Routing: vue-router
- Testing: Vitest + Cypress (E2E)
- Mobile: Quasar + Capacitor (oder Quasar CLI mobile targets)
- Backend: API‑first (REST/JSON) — empfohlen: NestJS + Prisma oder FastAPI + SQLModel
- DB: PostgreSQL
- Cache/Realtime: Redis / WebSockets
- Object Storage: S3 (AWS) oder S3‑kompatibel
- Auth: OpenID Connect (Keycloak/Auth0/Azure B2C)
- Infra: Docker, GitHub Actions, Staging/Prod; für MVP: managed container service
 
## 2.1 Persistenz für MVP — Lokale MongoDB

- Entscheidung: Für das MVP wird eine lokale MongoDB‑Instanz verwendet (developer‑freundlich, schnelle Iteration).
- Verbindung: Backend konfiguriert mit Umgebungsvariablen `MONGODB_URI` und optional `MONGODB_DB`.
- Hinweise:
  - Start lokal mit Docker Compose (`mongo` + `mongo-express` optional) oder nativer Installation.
  - Verwenden Sie eindeutige Indizes für häufige Abfragepfade (z. B. `ownerId`, `tags`, `createdAt`).
  - Setzen Sie `replicaSet` nicht zwingend für lokale Entwicklung; für Tests von Transaktionen/Replikation ggf. lokale rs‑Konfiguration.
  - Backups: Für MVP lokal -> regelmäßige DB‑Dumps; für Prod → Atlas oder Managed backups.
  - Migrationen: Nutzen Sie ein Migrations‑Tool (z. B. `migrate-mongo`, `umzug` mit JS/TS Skripts oder `prisma migrate` wenn Prisma genutzt wird).

## Lokaler Dev-Start (Beispiel mit Docker Compose)

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
```

Starten mit:
```bash
docker compose up -d
```

## Datenmodell‑Hinweise (kurz)
- Card Document (Beispiel):

```json
{
  "_id": "ObjectId",
  "ownerId": "string",
  "title": "string",
  "content": { /* flexible */ },
  "tags": ["string"],
  "attachments": [{ "url": "string", "meta": {} }],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

- Modellierungsregeln:
  - Embed when read together and small; reference when arrays grow unbounded.
  - Keep access patterns in mind; design compound indexes for queries like `(ownerId, tags, updatedAt)`.

## MVP‑Vereinfachungen

Für das MVP gelten folgende Vereinfachungen, um Time‑to‑Market zu minimieren:

- **Kein Redis / kein Cache‑Layer**: Alle Anforderungen werden zunächst direkt gegen MongoDB bedient. Caching kann später ergänzt werden, wenn Performance‑Hotspots auftreten.
- **Kein Object Storage**: Anhänge/Assets werden vorerst im Backend‑Dateisystem unter einem `uploads/` Verzeichnis gespeichert (mit Größen‑/Typ‑Limits). Bei Bedarf später auf S3/Blob Storage migrieren.
- **Authentifizierung durch die App (Self‑managed)**: Statt OIDC wird initial ein einfaches App‑eigenes Auth‑System verwendet:
  - Registrierung / Login mit E‑Mail oder Username + Passwort.
  - Passwörter mit `bcrypt` (empfohlener cost) salted hashen.
  - JWT Access Token (kurze Lebenszeit, z. B. 15 min) + Refresh Token (länger, httpOnly cookie or DB stored) für Session‑Management.
  - Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/request-password-reset` (optional).
  - Rate‑Limiting per IP / per account für Auth‑Endpoints.
  - Für E‑Mail basierte Flows (Password Reset) optional: lokale SMTP dev server oder skip für MVP.

Sicherheits‑Hinweise für Self‑Auth:

- Speichern Sie niemals Klartext‑Passwörter. Verwenden Sie `bcrypt` oder `argon2`.
- Schützen Sie Refresh‑Tokens (httpOnly cookies oder persistent DB‑tokens bound to device id).
- Setzen Sie Content Security Policy (CSP), TLS und Input‑Validation ein.
- Implementieren Sie Account‑Lockout / progressive delays nach wiederholten Fehlversuchen.
- Planen Sie die Migration zu OIDC vor (Mapping von external ids zu internen user records).

Migrationspfad später auf OIDC / Managed Storage:

- Auth: Externen OIDC Provider (Keycloak/Auth0) integrieren, Benutzer mapping und SSO unterstützen.
- Assets: Migration von lokalen Dateien zu S3/Blob (URL mapping / move script).


## 3. Projektstruktur (Frontend)
- src/
  - pages/
  - layouts/
  - components/
  - stores/ (Pinia)
  - composables/ (reusable hooks)
  - boot/ (Quasar boot files)
  - assets/
- public/
- quasar.config.ts

## 4. Quasar / Dev‑Commands (Starter)
```bash
# Quasar CLI installieren (falls noch nicht)
npm i -g @quasar/cli
# Neues Projekt
yarn create quasar
# Dev
quasar dev
# PWA build
quasar build -m pwa
# Mobile (Capacitor)
quasar build -m capacitor -T android
```

## 5. API‑MVP (minimal)
- POST /api/v1/auth/login  — Auth (OIDC / token exchange)
- POST /api/v1/auth/refresh
- GET  /api/v1/users/me
- GET  /api/v1/cards?ownerId=&page=&limit=
- POST /api/v1/cards
- GET  /api/v1/cards/{id}
- PUT  /api/v1/cards/{id}
- DELETE /api/v1/cards/{id}

Hinweis: Für Offline/Sync später: `/sync/changes` endpoints + change‑feed.

## 6. Offline & Sync (Kurz)
- Client DB: IndexedDB (localForage) in Web / SQLite via Capacitor in Mobile
- Sync: change queue + batched push, optimistic UI, last‑write‑wins OR CRDTs für komplexe Merges

## 7. CI/CD & Deployment
- GitHub Actions: test → build → deploy to staging → manual promote to prod
- Container registry, IaC minimal (Terraform/CloudFormation) optional

## 8. Observability & Security
- Logging: structured logs (JSON) + Sentry for errors
- Metrics: Prometheus + Grafana
- Tracing: OpenTelemetry
- Security basics: TLS, rate limiting, input validation, dependency scanning

## 9. Nächste Schritte (Vorschlag)
1. Detaillierte API‑Spec (OpenAPI) für MVP
2. Repository‑Scaffold: Quasar Frontend + minimal Backend (stubbed endpoints)
3. CI/CD Pipeline minimal (build + test)
4. Implement Basic Auth & sample CRUD


---
Erstellt als Starter‑Blueprint. Wenn Sie möchten, erstelle ich jetzt ein Repository‑Scaffold (Frontend + Backend stubs) oder nur die OpenAPI‑Spec. Welche Option bevorzugen Sie?