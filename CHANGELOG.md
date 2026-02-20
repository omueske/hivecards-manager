# Changelog

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
