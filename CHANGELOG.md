# Changelog

All notable changes to Memory Drop are documented in this file.

Format inspired by [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/) starting at `0.1.0` (pre-production MVP).

## [0.1.0] — 2026-10-05

First production-shaped MVP: private wedding collections, guest upload-only links, Google Drive storage, and a branded admin experience.

### Added — Product

- Marketing landing page with Memory Drop brand (rose/champagne wash, serif/sans typography, scroll reveals, polaroid/phone storytelling)
- Guest upload flow via private capability URL (`/upload/[token]`) with thank-you state
- Admin email/password auth (Better Auth) with dashboard and wedding workspace
- Create wedding collections; OWNER / ADMIN roles via `WeddingAdmin`
- Wedding workspace sidebar: Photos & Videos, Link & Sharing, Settings, Team, Google Drive status
- Media gallery: grid, select mode, download, bulk delete, load more
- Fullscreen lightbox with prev/next, filmstrip, keyboard controls, and slideshow
- Progressive lightbox loading (grid thumb → large Drive thumbnail; original reserved for download)
- Link & Sharing: copy guest upload link, QR generate / download / refresh
- Settings: name, event date, guest upload toggle, size limits, Drive connect/reconnect, regenerate upload link
- Team: list admins, invite by email (existing accounts), remove (owner only)
- Event date stored separately from collection `createdAt`; shown in sidebar and dashboard cards

### Added — Platform

- Next.js App Router + TypeScript + Tailwind 4 + shadcn/ui
- PostgreSQL + Prisma (migrations, seed user/wedding for local dev)
- `StorageProvider` abstraction with `GoogleDriveStorageProvider` (`drive.file` scope)
- Same-origin guest upload proxy into Drive (avoids browser→Drive CORS issues)
- Encrypted Drive OAuth tokens at rest (AES-256-GCM)
- Upload tokens hashed at rest (SHA-256); raw token only in guest URL
- Zod validation, structured logging with secret redaction
- Security headers and `/admin` session gate via `proxy.ts`
- Unit tests for permissions, guest privacy expectations, and security helpers
- Docker Compose Postgres for local development
- Docs: `README.md`, `docs/ARCHITECTURE.md`

### Changed

- Admin UI aligned to brand: light wash, white panels, chapter rules, bloom CTAs
- Dashboard restyled to match wedding workspace (event date + Drive status on cards)
- Sharing / Settings / Team moved from blocky cards to editorial layouts inside white panels
- Settings / Sharing / Team CTAs restored as proper buttons (not underline links)

### Security (MVP baseline)

- Session cookies via Better Auth; wedding APIs require membership checks
- Guests cannot list or download media
- Owner-only: regenerate link, manage team, connect Drive
- In-memory rate limit on guest upload session creation (single-instance)

### Known gaps (tracked in `ROADMAP.md`)

- Open self-registration; no email verification, 2FA, or login rate limiting
- No zip bulk download; no delete-wedding UI
- Drive disconnect UI incomplete relative to role matrix
- Large originals still slow if downloaded; lightbox uses Drive thumbnails for view speed
- Not production-hardened for multi-instance rate limits or Google OAuth app verification

---

## Unreleased

_Changes after 0.1.0 will be listed here until the next tagged release._
