---
name: 'Node.js Backend Instructions'
description: 'Anweisungen für Node.js/Express Backend mit Tests'
applyTo: 'backend/**,server/**,**/api/**,**/*.js,**/*.ts'
---

# Node.js Backend Standards

## Allgemeine Regeln

- Umfangreiches Logging über alle LogLevel ist mandatorisch
- Async/Await statt Promises; immer try-catch für Fehler.
- TypeScript wo möglich, mit Interfaces für Requests/Responses.
- nestjs als Framework
- openapi für API-Dokumentation und Client-Generierung.
- Umgebungsvariablen über `.env` und `dotenv` laden; keine Secrets im Code.
- Mandatorische Felder sind mit Checks zu versehen

## API-Endpoints

- RESTful: GET/POST/PUT/DELETE mit Status-Codes (200, 201, 400, 401, 500).
- JSON-Responses: { success: true, data: ..., message: ... }.
- Auth: JWT mit express-jwt; bcrypt für Passwörter.

## Testfallgenerierung (Jest/Supertest)

- Immer Unit- und Integrationstests generieren.
- Mock DB (Prisma/Mongoose) mit jest.mock.
- Testfälle: Happy Path, Edge Cases (leere Arrays, ungültige IDs), Fehler (401, 500).
- 90% Coverage; AAA-Pattern: Arrange, Act, Assert.

Beispiel für POST /users:

```javascript
test('POST /users valid data', async () => {
  const res = await request(app).post('/users').send({ name: 'Test', email: 'test@example.com' });
  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
});
```
