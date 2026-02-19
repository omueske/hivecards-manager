# Hivecards Manager — Backend (scaffold)

Minimal NestJS scaffold for the Hivecards Manager MVP.

Quick start (after installing dependencies):

```bash
# install
npm install

# start MongoDB locally (optional)
docker compose up -d

# start dev server
npm run dev
```

Environment variables: copy `.env.example` to `.env` and adjust `JWT_SECRET`.

What this scaffold includes:
- NestJS minimal app structure
- Mongoose integration
- Simple JWT based auth (register/login)
- `Hive` module with CRUD endpoints
- `docker-compose.yml` with MongoDB for local dev
# hivecards-manager