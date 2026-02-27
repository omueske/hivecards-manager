# Hivecards Benutzerdokumentation

## 1. Zweck der Anwendung

Hivecards unterstützt dich bei der täglichen Arbeit am Bienenstand.
Die Anwendung kombiniert:

- Verwaltung von Ständen und Völkern
- Digitale Stockkarten mit Chronologie
- Königinnenverwaltung inkl. Historie
- Zuchtbuch mit BeeBreed-orientiertem Datenmodell
- Export- und Auswertungsfunktionen

Diese Dokumentation beschreibt alle zentralen Funktionen aus Anwendersicht.

---

## 2. Erster Start

### 2.1 Registrierung und Anmeldung

1. Konto über **Registrieren** erstellen.
2. Mit E-Mail und Passwort anmelden.
3. Optional E-Mail bestätigen (falls aktiviert).

### 2.2 Sprache einstellen

Über die Sprachauswahl im Kopfbereich zwischen Deutsch und Englisch wechseln.

### 2.3 Profil-Basiseinstellungen

Im Profil kannst du Züchter-Standardwerte hinterlegen:

- `L1A` Land
- `LV1A` Landesverband
- `Z1A` Züchternummer
- Standard-Standnummer (`NST`)
- Standard-Begattungsart
- Datumsmodus

Diese Werte werden im Zuchtbuch bei neuen Einträgen als Ausgangswerte genutzt.

---

## 3. Navigation

Zentrale Bereiche:

- **Start**: Dashboard / Überblick
- **Völker**: Liste aller Völker
- **Standorte**: Apiaries / Standorte
- **Königinnen**: Königinnenliste und Historie
- **Zuchtbuch**: Zucht- und Leistungsdaten
- **Profil**: Benutzer- und Züchtereinstellungen
- **Dokumentation**: Diese Hilfeseite

---

## 4. Standorte (Apiaries)

Im Bereich **Standorte** kannst du:

- neue Standorte anlegen
- bestehende Standorte bearbeiten
- Standorte löschen

Hinweis: Beim Löschen eines Standortes werden zugeordnete Völker auf „Kein Ort“ umgehängt (wenn so konfiguriert).

---

## 5. Völkerverwaltung

## 5.1 Volk anlegen

Beim Anlegen eines Volkes definierst du grundlegende Stammdaten (z. B. Beutentyp, Standort, Rahmendaten).

### 5.2 Volk bearbeiten

In der Volk-Detailansicht können Stammdaten jederzeit angepasst werden.

### 5.3 Archivierung/Löschen

Je nach Bereich wird ein Volk gelöscht oder archiviert. Prüfe vor dem Löschen, ob relevante Historie exportiert wurde.

---

## 6. Stockkarte / Chronologie

Die Stockkarte ist das tägliche Arbeitstagebuch pro Volk.

Unterstützte Eintragstypen:

- Durchsicht
- Behandlung
- Fütterung
- Ernte
- Notiz

Typische Felder:

- Datum / optional Uhrzeit
- Wetter
- Brutstatus / Brutergebnis
- Varroa-Wert
- Maßnahmen
- Notizen

Ziel: Eine lückenlose, nachvollziehbare Chronologie je Volk.

---

## 7. Königinnen

## 7.1 Königin anlegen

Pflegbare Informationen:

- Bezeichnung
- Königinnenjahr
- Zeichenfarbe
- Herkunft
- Begattungsart
- Markiert (Ja/Nein)
- Status (aktiv, Reserve, tot, verkauft)
- Notizen

### 7.2 Jahresfarbe

Die Jahresfarbe wird automatisch aus dem Jahr vorgeschlagen.
Wenn du die Farbe manuell änderst, bleibt deine Auswahl erhalten.

### 7.3 Volk-Zuordnung und Historie

Beim Umsetzen einer Königin wird die Historie fortgeführt:

- offene Zuordnung wird geschlossen
- neue Zuordnung wird mit Datum angelegt

So bleibt nachvollziehbar, wann welche Königin in welchem Volk war.

---

## 8. Zuchtbuch

Das Zuchtbuch dient der strukturierten Erfassung von Zucht- und Leistungswerten.

### 8.1 Kernfelder

- `L1A`, `LV1A`, `Z1A`, `NR1A`, `J1A`
- `1A` (automatisch berechnet, read-only)
- `NST`
- `ANPAARTYP`
- `LINIE`
- Datum und Notizen

### 8.2 1A-Logik

Der `1A`-Code wird automatisch aus den Kürzeln aufgebaut:

`L1A-LV1A-Z1A-NR1A-J1A`

### 8.3 Weitere BeeBreed-Felder

Über **Weitere Felder** können zusätzliche, fest definierte BeeBreed-Felder gepflegt werden (u. a. `PAARTYP`, `BIMI*`, `BOMI*`, Datumsfelder).

Alle Datumsfelder sind über DatePicker auswählbar.

### 8.4 Synchronisation zur Königin

Beim Speichern eines Zuchtbuch-Eintrags werden relevante Daten mit der verknüpften Königin synchronisiert (abhängig vom Zustand der Königin):

- Begattungsart
- Jahr / Jahresfarbe
- Herkunft
- Notizen

Wenn im Eintrag ein Volk ausgewählt ist, wird die Königin automatisch diesem Volk zugeordnet.

### 8.5 CSV-Funktionen

- CSV-Import mit Vorschau/Validierung
- CSV-Export im BeeBreed-orientierten Format

---

## 9. Datumsmodi

Je nach Einstellung im Profil können Datumsangaben in unterschiedlichen Modi erfasst werden:

- Vollständiges Datum
- Tag/Monat
- Kalenderwoche

Wähle den Modus passend zu deinem Erfassungsprozess.

---

## 10. Admin-Bereich

Der Admin-Bereich ist nur für Benutzer mit Admin-Rolle sichtbar.

Typische Aufgaben:

- Rollenverwaltung
- Systemnahe Einstellungen

---

## 11. Tipps für den Praxisbetrieb

- Erfasse Durchsichten möglichst zeitnah.
- Nutze einheitliche Notizkonventionen (z. B. Kurzpräfixe).
- Hinterlege Profil-Standards, um Erfassungszeit zu reduzieren.
- Nutze Export regelmäßig als Backup/Übergabeformat.

---

## 12. Fehlerbehebung (FAQ)

### Ich sehe keine Daten nach dem Login

- Prüfe, ob du im richtigen Konto bist.
- Seite neu laden.
- Bei Session-Problemen erneut anmelden.

### Ein Feld aktualisiert sich nicht wie erwartet

- Speichern und Eintrag erneut öffnen.
- Prüfen, ob das Feld read-only oder automatisch berechnet ist.

### CSV-Import meldet Fehler

- Kopfzeilen prüfen.
- Datumsformate vereinheitlichen.
- Pflichtfelder je Zeile ergänzen.

---

## 13. Datenschutz und Datenqualität

- Erfasse nur notwendige personenbezogene Daten.
- Prüfe Einträge regelmäßig auf Vollständigkeit.
- Nutze konsistente Schreibweisen bei Herkunft/Linien.

---

## 14. Release-Infos

Technische Änderungen und neue Features findest du zusätzlich im **Changelog**.

---

## 15. Kurz-Glossar

- **Apiary / Standort**: Physischer Bienenstand
- **Volk**: Eine Bienenkolonie
- **Stockkarte**: Verlauf aller Maßnahmen/Beobachtungen pro Volk
- **1A**: Zusammengesetzter Zuchtcode
- **ANPAARTYP / PAARTYP**: Begattungsart-Codierung
- **BIMI/BOMI**: BeeBreed-Felder für Serienwerte
