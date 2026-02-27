# Breeding Book for Beginners

The Breeding Book stores structured breeding data.

## 1) What matters most

Core fields:

- `L1A`, `LV1A`, `Z1A`, `NR1A`, `J1A`
- `1A` (auto-generated)
- `NST`
- `ANPAARTYP`
- line, date, notes

---

## 2) Why is 1A read-only?

The 1A code is generated automatically from key parts.

Benefits:

- fewer typing mistakes
- consistent structure
- easier comparison

---

## 3) Additional fields

Use **More fields** for fixed additional BeeBreed fields.

These are predefined fields, not free-form custom keys.

All date-related fields use date pickers for consistency.

---

## 4) Queen synchronization

Saving a Breeding Book entry can update queen data (for example mating type, year/color, origin, notes).

If a hive is selected in the entry, the queen is assigned to that hive automatically.

---

## 5) CSV import/export

- **Import**: preview and validation included
- **Export**: BeeBreed-oriented CSV

Tip: test imports with a small file first.

---

## 6) Common import problems

- missing required columns
- inconsistent date values
- wrong separators

Use preview to catch issues early.
