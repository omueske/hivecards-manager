# Test-Anleitung für hivecards-manager

Zweck
- Kurze Anleitung für das Schreiben, Ausführen und Organisieren von Tests im Monorepo (Backend + Frontend).

Voraussetzungen
- Node.js installiert (empfohlen v16+ oder kompatibel mit Projekt-Tooling).
- Im Backend: devDependencies installiert (`npm install` im Repo-Root).
- Im Frontend: devDependencies installiert (`npm install` im `frontend`-Ordner oder `npm --prefix frontend install`).

Test-Arten
- Unit Tests (schnell, isoliert)
  - Backend: Jest (Projekt: backend-unit)
  - Frontend: Vitest (im `frontend`-Paket)
- Integrationstests (grösser, evtl. DB, HTTP)
  - Backend: Jest Integration (Projekt: backend-integ), nutzt mongodb-memory-server / supertest
- Komplett- / Coverage-Lauf
  - Root-Skript läuft alle konfigurierten Jest-Projekte mit Coverage

Wo Tests ablegen
- Backend
  - Bevorzugt neben der implementierenden Datei oder in `src/__tests__`.
  - Dateinamen: `*.spec.ts` oder `*.test.ts`.
- Frontend
  - Komponenten- und Composables-Tests im Ordner `frontend/src` neben der jeweiligen Datei.
  - Dateinamen: `*.spec.ts`.

Konventionen
- Beschreibe klar das erwartete Verhalten (Arrange-Act-Assert).
- Verwende Mocks/Stubs für externe Dienste (E-Mail, externe APIs).
- Integrationstests dürfen echte DB-Zugriffe nur gegen `mongodb-memory-server` ausführen.
- Säubere globale Zustände zwischen Tests (z.B. `afterEach(() => jest.clearAllMocks())`).

Schnelle Beispiele
- Backend (Jest + Supertest)

```ts
// example.spec.ts
import request from 'supertest';
import { app } from '../src/main';

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
  });
});
```

- Frontend (Vitest + @vue/test-utils)

```ts
import { mount } from '@vue/test-utils';
import MyComponent from '../src/components/MyComponent.vue';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('renders', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.exists()).toBe(true);
  });
});
```

Wichtige Befehle (vom Repo-Root)
- Alle Backend- und Frontend-Jest-Projekte mit Coverage: `npm run test`
- Backend Unit Tests: `npm run test:unit`
- Backend Integrationstests: `npm run test:integ`
- Frontend (Vitest) lokal: `npm --prefix frontend run test:unit` oder `cd frontend && npm run test:unit`
- Watch-Modus (Jest): `npm run test:watch`

Tipps für CI
- Nutze `npm run test` im CI, damit Coverage konsistent erzeugt wird.
- Für Frontend-Unit-Tests in CI: `npm --prefix frontend run test:unit:ci` (führt `vitest run`).

Fehlerbehebung
- Langsame Tests: zuerst Unit-Tests laufen lassen; Integrationstests separat ausführen.
- Probleme mit DB-Verbindung: sicherstellen, dass keine echte Mongo-Instanz offen ist; Integrationstests nutzen mongodb-memory-server.

Weiteres
- Wenn du Beispiele brauchst (Mock-Setup, Test-Utilities, Factory-Funktionen), sag Bescheid — ich schreibe gern ein Template oder ein konkretes Test-Scaffold.
