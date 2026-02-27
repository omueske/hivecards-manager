# Zuchtbuch für Einsteiger

Das Zuchtbuch ist für strukturierte Zuchtdaten gedacht.

## 1) Was ist wichtig?

Die wichtigsten Felder sind:

- `L1A`, `LV1A`, `Z1A`, `NR1A`, `J1A`
- `1A` (automatisch berechnet)
- `NST`
- `ANPAARTYP`
- Linie, Datum, Notiz

---

## 2) Warum ist 1A read-only?

Der 1A-Code wird aus den Kürzeln automatisch aufgebaut.

Vorteile:

- weniger Tippfehler
- einheitliche Struktur
- bessere Vergleichbarkeit

---

## 3) Weitere Felder

Unter **Weitere Felder** findest du zusätzliche BeeBreed-Felder.

Dort sind feste Felder vorhanden, keine freien Fantasie-Felder.

Alle Datumsfelder haben DatePicker, damit Eingaben konsistent bleiben.

---

## 4) Synchronisation mit Königin

Beim Speichern kann das Zuchtbuch Königinndaten aktualisieren (z. B. Begattungsart, Jahr/Farbe, Herkunft, Notiz).

Wenn im Eintrag ein Volk ausgewählt ist, wird die Königin diesem Volk automatisch zugewiesen.

---

## 5) CSV Import/Export

- **Import**: mit Vorschau und Fehlermeldungen
- **Export**: BeeBreed-orientiertes CSV

Tipp: Vor großem Import zuerst mit kleiner Datei testen.

---

## 6) Häufige Importprobleme

- Pflichtfelder fehlen
- Datumswerte uneinheitlich
- falsche Trennzeichen

Nutze die Vorschau, um Fehler früh zu sehen.
