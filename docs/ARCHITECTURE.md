# Architecture — Private Wedding Memories

## Product principle

> Guests can contribute memories, but guests cannot see the memories.

The MVP is private by design. There is no public guest gallery.

## Separation of concerns

```text
Application (auth, weddings, media metadata, permissions, UI)
        │
  StorageProvider interface
        │
  GoogleDriveStorageProvider
        │
  Google Drive (file bytes only)
```

Application permissions are independent of Google Drive sharing. Guests never receive Drive credentials or media listing APIs.

## Stack

- Next.js App Router + TypeScript
- PostgreSQL + Prisma ORM
- Better Auth (email/password, HTTP-only session cookies)
- Tailwind CSS + shadcn/ui
- Zod validation
- Google OAuth 2.0 + Drive API v3

## Google Drive OAuth scope

**Chosen scope:** `https://www.googleapis.com/auth/drive.file`

**Why:** Least privilege that still allows creating wedding folders and uploading/reading/deleting files created by this application. It is a non-sensitive scope and avoids full Drive access (`drive`).

OAuth verification for production Google Cloud projects can be completed later without changing app architecture.

## Guest upload tokens

- Guest URL: `/upload/[token]`
- Token is a cryptographically random capability string
- Only a SHA-256 hash is stored (`Wedding.uploadTokenHash`)
- Grants **UPLOAD only** — enforced server-side
- Regenerating the token invalidates the previous URL immediately
- No guest API returns wedding media

## Large file uploads

Guests upload to the application over the same origin (`POST /api/upload/file`).
The server streams bytes into Google Drive via the Drive API (googleapis media upload).

This avoids browser CORS limits on `googleapis.com` upload sessions while keeping
Drive credentials server-side only.

Direct browser→Drive resumable uploads remain available on the storage adapter for
future use, but the guest UI uses the same-origin proxy path.


## Roles

| Actor | Capabilities |
|---|---|
| Guest (upload token) | Upload only |
| Wedding `ADMIN` | View/download/delete media, view settings |
| Wedding `OWNER` | Everything ADMIN can do + manage admins, disconnect Drive, delete wedding, regenerate token |

Platform users authenticate with Better Auth. Wedding access is always checked via `WeddingAdmin`.

## Security baselines

- Encrypt Drive access/refresh tokens at rest (AES-256-GCM, `ENCRYPTION_KEY`)
- Never expose OAuth secrets, refresh tokens, or raw upload tokens in logs or client code
- Validate all inputs with Zod
- Rate-limit guest upload session creation (in-memory sliding window; single-instance MVP)
- Rate-limit admin sign-in / sign-up by IP (Better Auth; always enabled)
- Lock email after 5 failed sign-ins in 15 minutes (in-memory; 15-minute lock)
- Security headers via Next.js middleware/proxy
- CSRF protection for cookie-authenticated admin mutations (Better Auth + same-site cookies)

## Configuration limits (env)

```text
MAX_PHOTO_SIZE_BYTES=26214400   # 25 MB
MAX_VIDEO_SIZE_BYTES=1073741824 # 1 GB
```

## Local development

- `docker-compose.yml` provides PostgreSQL (optional if local Postgres is available)
- Seed creates a development user + wedding **without** fake Drive credentials
- Connect Google Drive explicitly via OAuth

## Out of scope (MVP)

Public guest gallery, guest accounts, social features, AI, payments, alternate storage providers, native apps.
