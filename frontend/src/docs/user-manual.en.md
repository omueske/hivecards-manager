# Hivecards User Documentation

## 1. Application Purpose

Hivecards helps you run day-to-day beekeeping workflows in one place.

Core capabilities:

- Apiary and hive management
- Digital hive logs (chronology)
- Queen management with assignment history
- Breeding Book with BeeBreed-oriented structure
- Import/export support

This guide covers all major user-facing features.

---

## 2. Getting Started

### 2.1 Register and Sign In

1. Create an account in **Register**.
2. Sign in using email and password.
3. Verify your email if verification is enabled.

### 2.2 Select Language

Use the language selector in the header to switch between German and English.

### 2.3 Profile Defaults

In **Profile**, set your breeder defaults:

- `L1A` country
- `LV1A` association
- `Z1A` breeder number
- default apiary number (`NST`)
- default mating type
- date input mode

These values are reused when creating Breeding Book entries.

---

## 3. Navigation

Main areas:

- **Home**: dashboard overview
- **Hives**: colony list
- **Apiaries**: locations
- **Queens**: queen records and history
- **Breeding Book**: breeding data
- **Profile**: user settings
- **Documentation**: this manual

---

## 4. Apiaries

In **Apiaries**, you can:

- create locations
- edit locations
- delete locations

If a location is removed, related hives can be reassigned to “no location” depending on current logic.

---

## 5. Hive Management

### 5.1 Create a Hive

Create hives with the required basic data (for example location and hive settings).

### 5.2 Edit a Hive

Update hive master data anytime from the hive detail view.

### 5.3 Archive/Delete

Depending on the area, records may be archived or deleted. Export relevant data before cleanup.

---

## 6. Hive Log / Chronology

The hive log is your operational timeline per hive.

Supported entry types:

- inspection
- treatment
- feeding
- harvest
- note

Typical fields:

- date / optional time
- weather
- brood state/result
- varroa value
- actions taken
- notes

Goal: keep a complete traceable history per hive.

---

## 7. Queens

### 7.1 Create and Maintain Queens

Available fields include:

- label
- queen year
- marking color
- origin
- mating type
- marked (yes/no)
- status (active, spare, dead, sold)
- notes

### 7.2 Year Color Automation

Color is auto-suggested from queen year.
If you manually pick another color, your manual selection is preserved.

### 7.3 Assignment History

When moving queens between hives, history is maintained:

- open assignment is closed
- new assignment is created with date

---

## 8. Breeding Book

The Breeding Book stores structured breeding and performance data.

### 8.1 Core Fields

- `L1A`, `LV1A`, `Z1A`, `NR1A`, `J1A`
- `1A` (auto-generated, read-only)
- `NST`
- `ANPAARTYP`
- `LINIE`
- date and notes

### 8.2 1A Logic

`1A` is automatically built from:

`L1A-LV1A-Z1A-NR1A-J1A`

### 8.3 Additional BeeBreed Fields

Use **More fields** to edit fixed additional BeeBreed fields (for example `PAARTYP`, `BIMI*`, `BOMI*`, related date fields).

All date fields use a date picker.

### 8.4 Queen Synchronization

Saving a Breeding Book entry can synchronize queen data:

- mating type
- year and year color
- origin
- notes

If a hive is selected in the entry, the queen is automatically assigned to that hive.

### 8.5 CSV Functions

- CSV import with preview/validation
- CSV export in BeeBreed-oriented format

---

## 9. Date Input Modes

Profile settings support different date modes:

- full date
- day/month
- calendar week

Choose the mode that best fits your field workflow.

---

## 10. Admin Area

Visible only for admin users.

Typical tasks:

- role management
- system-level administration

---

## 11. Best Practices

- log inspections shortly after work is done
- use consistent note conventions
- maintain profile defaults to reduce repetitive input
- export regularly as backup/transfer

---

## 12. Troubleshooting (FAQ)

### I cannot see my data after login

- confirm you use the correct account
- reload the page
- sign out/in again if session tokens are stale

### A field does not behave as expected

- save and reopen the record
- check whether the field is auto-generated or read-only

### CSV import returns errors

- verify header names
- normalize date formats
- complete required columns

---

## 13. Data Quality and Privacy

- store only necessary personal data
- review records periodically for completeness
- use consistent naming for origin/line values

---

## 14. Release Notes

Use **Changelog** for technical changes and release-by-release details.

---

## 15. Short Glossary

- **Apiary**: physical beekeeping location
- **Hive**: one bee colony
- **Hive Log**: chronological operational record
- **1A**: composite breeding code
- **ANPAARTYP / PAARTYP**: mating type coding
- **BIMI/BOMI**: BeeBreed series fields
