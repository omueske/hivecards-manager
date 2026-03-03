# Bestandsbuch (Medication Register) – Detailed Guide

This chapter explains the full Bestandsbuch workflow: entry creation, synchronization behavior, sorting, and printing.

---

## 1. Purpose

Bestandsbuch records medication usage per hive in a structured, year-based format.

Main goals:

- complete treatment documentation
- quick year-level traceability
- consistent data between hive log and medication register
- printable yearly overview for records

---

## 2. Where to find it

Open **Bestandsbuch** in the main navigation.

Top controls:

- **Year selector**
- **Create** (new entry)
- **Print** (print current year)

---

## 3. Year view and table

The table lists all entries for the selected year.

Behavior:

- Columns are sortable via header click (ascending/descending).
- Default sorting is by application date descending.
- Edit/Delete actions are available in the action column.

---

## 4. Create an entry (step by step)

1. Click **Create**.
2. Set **Application date**.
3. Select **Apiary** first, then **Hive**.
4. Enter medication, administration type, and amount.
5. Optionally fill additional fields (for example withdrawal period, notes).
6. Save.

Notes:

- Input groups are structured for practical day-to-day workflow.
- Hive options are filtered by selected apiary.

---

## 5. Auto-filled values

To reduce typing, several fields are prefilled automatically:

- beekeeper/user data from profile (for example name, address, phone)
- treated-by value (if not explicitly set)
- hive label generated from apiary + hive number

You can still adjust values in the form when needed.

---

## 6. Medication selection and custom entries

The **Medication name** field includes:

- default medications
- previously saved custom medications

Use **New** next to the field to add a medication. It becomes available in the selection list immediately.

---

## 7. Synchronization with hive log

Bestandsbuch and hive-log treatment entries are synchronized both ways.

### Direction A: Hive log → Bestandsbuch

Creating/updating/deleting a treatment in the hive log creates/updates/removes the linked Bestandsbuch entry.

### Direction B: Bestandsbuch → Hive log

Creating/updating/deleting a Bestandsbuch entry creates/updates/removes the linked treatment in the hive log.

This keeps data consistent without duplicate manual maintenance.

---

## 8. Date display from profile setting

Date rendering in the Bestandsbuch table follows profile date mode:

- full date
- day/month
- calendar week

If no specific mode is set, full date is used by default.

---

## 9. Printing yearly records

Use **Print** to print the selected year.

Print optimizations:

- technical table footer elements are hidden in print output
- horizontal print scrollbar is avoided
- landscape is configured as print default
- cells wrap in print to improve readability

Note: Browser/driver print settings can still override defaults.

---

## 10. Recommended operational workflow

1. Record treatment during inspection (from hive log or Bestandsbuch).
2. Verify synchronization in the other area.
3. At month end, sort by date or hive and spot-check data quality.
4. Print or save PDF of yearly records for filing.

---

## 11. Common questions

### Why is a hive missing in the selector?

Check selected apiary first. Hive list is bound to that selection.

### Why does hive label look different than expected?

The label is generated from apiary and hive number and may reflect existing synced data.

### Why does date display look unusual?

Check your profile date mode; table rendering follows this setting.

### Why do I see apparent duplicates?

Normally duplicates should not occur. Verify whether the same treatment was entered manually in both areas as separate actions.

---

## 12. Data quality recommendations

- use consistent medication naming
- keep notes short but unambiguous
- correct wrong entries quickly
- review and archive yearly views regularly
