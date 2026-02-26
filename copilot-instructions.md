Copilot-Anweisungen für Test-Erstellung (Deutsch)

Zweck
- Diese Datei gibt Richtlinien für GitHub Copilot / KI-Assistenten beim Erstellen, Ändern oder Ergänzen von Tests im Projekt.

Allgemeine Regeln
- Sprache: Deutsch für Kommentare/Instruktionen, Code bleibt in TypeScript/JS.
- Test-Frameworks: Backend nutzt Jest, Frontend nutzt Vitest.
- Dateinamen: Verwende `*.spec.ts` oder `*.test.ts`.
- Platzierung: Backend-Tests neben Implementierung oder in `src/__tests__`. Frontend-Tests neben Komponenten in `frontend/src`.
- Keep changes minimal: Ergänze nur die relevanten Testdateien, ändere keinen unrelated code.

Konventionen beim Erzeugen von Tests
- Schreibe klare, deterministische Tests (keine flakiness).
- Verwende Arrange-Act-Assert Struktur.
- Mocke externe Dienste (E-Mail, externe APIs, S3, etc.).
- Integrationstests dürfen `mongodb-memory-server` verwenden — keine echte DB-Verbindung.
- Verwende vorhandene Test-Utilities wenn vorhanden (z. B. Factories, helper functions).
- Säubere globale Mocks nach jedem Test (`afterEach(() => jest.clearAllMocks())`).

Backend-spezifisch (Jest)
- Imports: `import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'` ist optional; gängige globale Helfer sind verfügbar.
- HTTP-Tests: Verwende `supertest` gegen die Nest-App-Instanz.
- Database: Für Integrationstests `mongodb-memory-server` starten; setze `jest.setTimeout()` falls nötig.

Frontend-spezifisch (Vitest + Vue)
- Komponenten: Verwende `@vue/test-utils` und `vitest` (`describe`, `it`, `expect`).
- Browser-APIs: Nutze `jsdom` im Test-Setup.

Beispiel-Template — Backend (Jest + Supertest)

```ts
// src/hives/hives.controller.spec.ts
import request from 'supertest';
import { app } from '../../src/main';

describe('HivesController (Integration)', () => {
  it('GET /hives returns 200', async () => {
    const res = await request(app.getHttpServer()).get('/hives');
    expect(res.status).toBe(200);
  });
});
```

Beispiel-Template — Frontend (Vitest + Vue)

```ts
// frontend/src/components/MyComponent.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
  it('renders', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.exists()).toBe(true);
  });
});
```

Projekt-spezifische Befehle
- Root-Repo Tests (Jest): `npm run test`
- Backend Unit Tests: `npm run test:unit`
- Backend Integrationstests: `npm run test:integ`
- Frontend Vitest (lokal): `npm --prefix frontend run test:unit`
- Frontend CI: `npm --prefix frontend run test:unit:ci`

Do's & Don'ts
- Do: Schreibe kleine, fokussierte Tests; dokumentiere besondere Setup-Schritte in `doc/test-instructions.md`.
- Don't: Netzwerkanfragen in Unit-Tests ausführen; echte Produktions-DB/Services verwenden.

Wenn unklar
- Wenn eine Entscheidung nicht klar ist (z. B. Unit vs Integration), schlage zwei kuratierte Testfälle vor und dokumentiere die Gründe.
- Bei größeren Ergänzungen erstelle bitte ein PR-Template- oder Kommentar-Block mit den Testabsichten.

Pflege
- Halte diese Datei synchron mit `doc/test-instructions.md`.
- Wenn neue Test-Utilities oder Patterns eingeführt werden, ergänze hier bitte ein kurzes Update.