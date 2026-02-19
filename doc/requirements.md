# Anforderungen

## Funktionale Anforderungen
- Nutzerverwaltung (Registrierung, Login)
- Kernfunktionalität (Beschreibe MVP-Features)
- Datenimport / -export
- Administrationsoberfläche

### MVP — Fachliche Anforderungen (konkret)

- Ziel: Minimaler, nutzbarer Funktionsumfang für Web + PWA mit späterer Mobile‑App.
- Akteure: Endnutzer (Owner), Gast (optional), Admin (optional).

- User Stories (priorisiert):
	1. Als Nutzer möchte ich mich registrieren und anmelden können, damit meine Karten privat sind.
		 - Akzeptanz: Registrierung speichert Benutzer mit gehashter Passwort, Login liefert JWT+Refresh.
	2. Als Nutzer möchte ich eine Liste meiner Cards sehen können, paginiert und sortierbar.
		 - Filter: by tag, fulltext search on title/content (basic).
	3. Als Nutzer möchte ich eine neue Card anlegen (Titel, Inhalt, Tags, optionale Attachment‑Upload).
	4. Als Nutzer möchte ich eine Card bearbeiten und löschen können.
	5. Als Nutzer möchte ich Details einer Card sehen können (Card‑Detail View).
	6. Als Nutzer möchte ich einfache Volltextsuche über meine Cards durchführen können.
	7. Als Nutzer möchte ich mich abmelden können (invalidate refresh token).

- Akzeptanzkriterien für Datenkonsistenz & Sync:
	- Alle CRUD‑Operationen sind idempotent per API (Client kann Operationen bei Netzwerkfehlern wiederholen).
	- Änderungen werden zeitgestempelt (`updatedAt`) für einfache Konfliktlösung. Für MVP: last‑write‑wins.

- Attachment Handling (MVP simple):
	- Max. 1 MB pro Datei, backend speichert unter `uploads/` und liefert URL.
	- Content‑Type und Viren-/MIME‑Checks rudimentär (file type whitelist).

- Admin / Maintenance (MVP minimal):
	- Admin kann Nutzer listen und löschen (optional, kann später folgen).

	## Domänenanforderungen — Imkerei (Kernfunktionen)

	Ziel: Abdeckung der zentralen Tätigkeiten einer Imkerei für das MVP.

	- Hauptentitäten (konzeptuell):
		- `Apiary` (Betrieb / Standortgruppe): name, location, notes
		- `Hive` / `Stockkarte`: id, apiaryId, hiveNumber, status (active/inactive), frameCount, installationDate, notes, attachments, ownerId, createdAt, updatedAt
		- `Queen` (Königin): id, hiveId, birthDate, origin (line), status (alive/removed), matingDate, breederNotes, tags
		- `BreedingRecord` (Zucht): id, queenId (or targetHiveId), breeder, date, method, pedigree, notes, result (success/failure), attachments
		- `HoneyRecord` (Honigbuch): id, hiveId, date, harvestWeightKg, honeyType, storageLocation, notes
		- `MedicationRecord` (Medikamentenbuch): id, hiveId, date, medication, dosage, operator, notes
		- `Inspection` (Durchsicht): id, hiveId, date, inspector, conditionSummary, actionsTaken, varroaCheck, broodStatus, notes

	- Wichtige Beziehungen: `Hive` belongsTo `Apiary`; `Queen` assignedTo `Hive`; `BreedingRecord`, `HoneyRecord`, `MedicationRecord`, `Inspection` reference a `Hive` (or `Queen`).

	- Kern‑User Stories (Imkerei‑Scope):
		1. Als Imker möchte ich für jeden Standort (`Apiary`) meine Völker (`Hive`) verwalten können (anlegen, verschieben, archivieren).
	 2. Als Imker möchte ich Stockkarten pflegen: technische Daten, Verlauf (history via `Inspection` und `MedicationRecord`) und Fotos.
	 3. Als Züchter möchte ich Königinnen‑Zuchtfälle erfassen und deren Ursprung / Resultate dokumentieren (`BreedingRecord`).
	 4. Als Imker möchte ich Honigernten protokollieren (`HoneyRecord`) inkl. Gewicht und Lagerung.
	 5. Als Imker möchte ich Medikamentengaben dokumentieren (`MedicationRecord`) für Nachweis und Rückverfolgbarkeit.
	 6. Als Imker möchte ich Durchsichten protokollieren (`Inspection`) mit Befunden und Maßnahmen.

	- Beispiel‑CRUD Endpoints (MVP):
		- `GET /api/v1/apiaries` , `POST /api/v1/apiaries`, `GET /api/v1/apiaries/{id}`
		- `GET /api/v1/hives?apiaryId=&status=` , `POST /api/v1/hives`, `GET /api/v1/hives/{id}`, `PUT /api/v1/hives/{id}`, `DELETE /api/v1/hives/{id}`
		- `GET /api/v1/queens?hiveId=` , `POST /api/v1/queens`, `PUT /api/v1/queens/{id}`
		- `POST /api/v1/breeding-records`, `GET /api/v1/breeding-records?hiveId=`
		- `POST /api/v1/honey-records`, `GET /api/v1/honey-records?hiveId=`
		- `POST /api/v1/medication-records`, `GET /api/v1/medication-records?hiveId=`
		- `POST /api/v1/inspections`, `GET /api/v1/inspections?hiveId=`

	- Such‑/Reporting‑Usecases (MVP minimal):
		- Filter hives by status, tags, apiary.
		- Query recent inspections / medication events for a given hive.
		- Export honey harvests as CSV per season (basic).

	- Datenintegrität / Business Rules (MVP):
		- Jede `HoneyRecord` und `MedicationRecord` referenziert genau ein `Hive` (not null).
		- `Queen` kann einen `status` wechseln (z. B. `replaced`) und muss ggf. deaktiviert bleiben für historische Zuordnung.
		- Historie bleibt unverändert (audit trail): records are append‑only; deletion should be soft by default.



## Nicht-funktionale Anforderungen
- Sicherheit: Auth, Zugriffskontrolle
- Performance: Antwortzeiten < X ms für Y Last
- Skalierbarkeit: horizontale Skalierung möglich
- Betrieb: Monitoring, Backups

## Technische Akzeptanzkriterien für MVP
- Lokale MongoDB als persistente Speicherschicht (siehe `doc/architecture.md`).
- Backend bietet OpenAPI‑konforme Spec (bereitstellbar als `/openapi.json`) vor Implementierung.
- CI: Linting + Unit Tests für Backend & Frontend in Pipeline.
- Dev Setup: `docker compose` mit MongoDB und Backend stub möglich.

## Annahmen
- Zielplattformen: Web / Mobile
- Verfügbare Ressourcen: Entwickler, Design

## Offene Fragen
- Datenschutz-Anforderungen (DSGVO) geklärt?
- Integrationspunkte zu Drittanbietern?
