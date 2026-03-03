# Changelog

## [0.1.31] - 2026-03-03

### Added
- improve bestandsbuch print layout and table sorting (a883ea5)
- add bestandsbuch module, sync, ui and profile refinements (e8d1e48)

## [0.1.30] - 2026-03-01

- minor improvements

## [0.1.29] - 2026-03-01

### Other
- Fix queen assignment dialog filtering and queen number labels (2857184)

## [0.1.28] - 2026-02-27

### Added
- add queen running number and improve breeding book/dashboard UX (910dc58)

## [0.1.27] - 2026-02-27

### Documentation
- add beginner documentation hub with subpages (fc19870)

## [0.1.26] - 2026-02-27

### Added
- breeding book and queen sync improvements (6b2eeac)

## [0.1.25] - 2026-02-26

### Added
- improve admin layout and fix tab panel rendering (b298ceb)

## [0.1.24] - 2026-02-26

### Added
- add admin panel, user management and stats (09da7b3)

## [0.1.23] - 2026-02-26

### Fixed
- align API base and add production compose templates (9e54cbb)

## [0.1.22] - 2026-02-26

- minor improvements

## [0.1.21] - 2026-02-26

### Added
- add RBAC roles and stabilize test suites (2c2d93a)

## [0.1.20] - 2026-02-26

- minor improvements

## [0.1.19] - 2026-02-26

### Fixed
- register quasar date components for hive datepicker (ae1f93c)
- stabilize frontend imports and optimize build chunking (619457e)

### Other
- Apply formatting updates and add router coverage test (c9ce3e3)
- Enforce mandatory resource fields end-to-end (6a82d21)

## [0.1.18] - 2026-02-26

### Added
- make email authentication case-insensitive (ffd8f9c)
- add automatic database index management (5eeeab8)
- personalize emails with username (f94732a)

### Tests
- add comprehensive unit tests for token, user store, and Apiaries (5465a58)
- add comprehensive interaction tests for HiveList and Queens components (476c3ad)
- improve test coverage with unit tests (dbe83e6)
- remove debug logs; expose validateForm/assignQueen for tests (32a2681)

### Other
- stabilize ForgotPassword spec; restore vitest pool config (39f1b00)

## [0.1.17] - 2026-02-22

### Changed
- apply prettier formatting (895b9d2)

## [0.1.16] - 2026-02-22

### Fixed
- use relative URL for token refresh (was falling back to localhost:3000) (7ed4069)

## [0.1.15] - 2026-02-22

### Fixed
- set CORS_ORIGIN to production domain (6a0cc67)
- disable CORS in production when CORS_ORIGIN is not set (same-origin only) (bc5c21d)
- decouple refresh cookie secure flag from NODE_ENV via COOKIE_SECURE env var (8dc0577)
- make APP_URL configurable via env for correct email links in production (beb0da4)

## [0.1.14] - 2026-02-22

### Added
- set navbar color to amber-8 (honey color) (4b71f1e)
- Handlebars mail templates via @nestjs-modules/mailer (f5ffb53)
- extended inspection form, treatment agents module, updated openapi spec (dc9cf4c)
- improve hive and queen form defaults and UX (0211551)

### Fixed
- show feeding/harvest fields in Stockkarte; register QCheckbox/QItem in Quasar (b017c45)

### Changed
- apply prettier formatting (7db3253)

### CI
- add :latest tag on main branch Docker builds (671b26c)

### Chore
- update en.json translations (a9ea9c2)
- use local hivecards-local image in docker-compose for dev (4eee543)
- fix frontend npm audit vulnerabilities (173c3b7)
- fix npm audit vulnerabilities (3e50f11)

## [0.1.13] - 2026-02-21

### Added
- add INFO for resource creation with IDs, downgrade reads to DEBUG (44a8979)

## [0.1.12] - 2026-02-21

### Fixed
- restore image: for production, keep build: as local-dev comment (dd7f1eb)

## [0.1.11] - 2026-02-21

### Added
- add email verification success page and fix public route redirect (85cc2ef)
- add configurable log level system with categorized output (eede748)

### Fixed
- use API endpoint URL in verification email link (354b030)
- resolve all pre-existing ESLint errors in frontend and tests (f213bea)

## [0.1.10] - 2026-02-21

### Chore
- document all env variables in docker-compose (88f9901)

## [0.1.9] - 2026-02-21

- minor improvements

## [0.1.8] - 2026-02-21

- minor improvements

## [0.1.7] - 2026-02-21

- minor improvements

## [0.1.6] - 2026-02-21

- minor improvements

## [0.1.5] - 2026-02-20

### Added
- move changelog link from menu to dashboard card (f2ad0c4)

## [0.1.4] - 2026-02-20

### Added
- add Changelog page rendering CHANGELOG.md with markdown (3b7c0f3)

## [0.1.3] - 2026-02-20

### Added
- group changelog entries by Conventional Commits type (50f1b61)

All notable changes to this project will be documented in this file.
Versions are bumped automatically before each push.
Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## [0.1.2] - 2026-02-20

### Chore
- add husky git hooks and update lock file (338dacd)

### Added
- register page, forgot/reset password pages, token auto-refresh, profile session info (5225a39)
- add email verification, forgot/reset password, and mail service (bbcc7d6)

## [0.1.1] - 2026-02-20

- git workflow: automatic version bump and changelog on push (husky pre-push hook)
- scripts/bump-version.mjs added

## [0.1.0] - 2025-02-20

### Added
- Separate `/register` page with password rules, show/hide toggle, and confirm field
- Email verification gate — login requires confirmed email address
- Forgot-password and reset-password flow (backend + frontend)
- MailService with nodemailer; Mailpit added to docker-compose for local dev email (SMTP:1025, UI:8025)
- Proactive JWT access-token refresh scheduler (`tokenRefresh.ts`) — refreshes 60 s before expiry
- Profile page session info card with live countdown and manual refresh button
- `ForgotPassword.vue` and `ResetPassword.vue` pages
- Routes: `/register`, `/forgot-password`, `/reset-password`
- i18n keys for all new auth and profile flows (en + de)

### Fixed
- Queen save/update — `putApiV1Queens` and `deleteApiV1Queens` were missing from generated API client
- `Queen` model type corrected to match actual backend schema
- API error messages now read from `e?.body?.message` (ApiError) as well as `e?.response?.data?.message`

### Changed
- `Login.vue` simplified to login-only; shows contextual hint for unverified email
- `Register.vue` shows "check your inbox" screen after submit instead of auto-login
- User schema extended with `emailVerified`, verification token, and password-reset token fields

---

## [0.0.x] - earlier

- Initial project setup: NestJS backend, Vue 3 + Quasar frontend, MongoDB
- Hive, Apiary, Inspection, Queen modules with CRUD endpoints
- JWT authentication with httpOnly refresh cookie (15 min access / 7 day refresh)
- i18n (German + English), Pinia user store, OpenAPI client generation
- Frontend served by NestJS in production via Express static middleware
- Various fixes for CORS, reverse-proxy, SPA catch-all routing
