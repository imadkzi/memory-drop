# Memory Drop

Private wedding photo & video collection backed by Google Drive.

Guests can contribute memories. Guests cannot see the memories.

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma
- Better Auth (email/password sessions)
- Google Drive (`drive.file` scope) via `StorageProvider`
- Tailwind CSS + shadcn/ui

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design decisions.

Release notes: [CHANGELOG.md](CHANGELOG.md) · Upcoming work: [ROADMAP.md](ROADMAP.md)

## Quick start

1. Copy env and fill Google OAuth values when ready:

```bash
cp .env.example .env
```

2. Start Redis. Postgres can stay on the local server you already use.

```bash
# Mac, no Docker:
brew install redis
brew services start redis

# Or, if you use Compose for Redis only (this does not start Postgres):
docker compose up -d redis
```

`REDIS_URL` stays `redis://localhost:6379` either way. `DATABASE_URL` keeps pointing at your local Postgres.

3. Install, migrate, seed:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

Seed credentials:

- Email: `dev@example.com`
- Password: `password123`

Connect Google Drive from wedding settings before guest uploads will succeed.

`GET /api/health` checks Postgres and Redis. Set `SENTRY_DSN` when you want server errors sent to Sentry. Production requires `REDIS_URL`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Security / validation unit tests |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:seed` | Development user + wedding |

## Google OAuth

Create an OAuth client in Google Cloud Console with redirect URI:

```text
http://localhost:3000/api/google/callback
```

Requested scope: `https://www.googleapis.com/auth/drive.file`
