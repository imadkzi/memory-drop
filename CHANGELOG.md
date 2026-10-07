# Changelog

All notable changes to Memory Drop are documented in this file.

Format inspired by [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/) starting at `0.1.0` (pre-production MVP).

## [Unreleased]

### Added

- New passwords must be at least 12 characters and cannot be the account email or a common password. Existing passwords can still sign in. Self-signup stays open until email verification.
- Password fields on sign-in, signup, and invites can show or hide what is being typed.

### Changed

- Lightbox photos fill the viewer. Browser-friendly originals replace the preview once loaded; HEIC stays on a 4096px JPEG frame
- Lightbox videos start from byte ranges (file head and tail) instead of waiting on a full download

## [0.1.1] — 2026-10-07

Deployed on Railway. Auth hardening, guest-link invites, zip download, legal pages, and gallery paging on top of the 0.1.0 MVP.

### Added

- Login / signup IP rate limiting via Better Auth (enabled in all environments; tighter caps on `/sign-in/email` and `/sign-up/email`)
- Email-based sign-in lockout after 5 failed attempts within 15 minutes (15-minute lock; cleared on successful sign-in)
- Admin invites by email: owner creates a copyable `/invite/[token]` link (7-day expiry, Admin role only). New users set a password; existing users sign in, then accept. Pending invites can be refreshed or revoked.
- Guest + admin empty states when Google Drive is not connected (uploads blocked with a clear message)
- Settings upload limits edited in MB (converted to bytes on save)
- Gallery bulk download as a zip (selected or all on page, up to 100 files)
- Privacy policy (`/privacy`) and terms (`/terms`), last updated 6 October 2026, written to the product as built: guest upload-only links, files stored in the owner's Google Drive, account and session data held by Memory Drop
- Shared legal layout with brand mark, privacy/terms navigation, and contact `hello@imadkazi.co.uk`
- Signup states that creating an account accepts the terms and privacy policy
- Guest upload screen links to the privacy policy and says files go to that wedding's collection
- Marketing footer links to the idea, the flow, privacy, terms, and contact
- `robots.ts` and `sitemap.ts` for public marketing/legal pages (admin, upload, invite, and API paths disallowed)
- Production deploy on Railway (managed Postgres, env secrets, HTTPS, `prisma migrate deploy`)
- Google Cloud OAuth production redirect URI, with the owner as a test user (`drive.file`; full app verification still optional for a private wedding)
- Production phone check: guest photo and video upload on cellular and WiFi

### Changed

- Marketing homepage split out of a single page into sections: floral hero, story, four-step flow, phone upload mock, privacy polaroids, and get-started
- Privacy band darkened so the guest-access copy reads on the rose wash
- Performance pass: marketing assets converted to WebP (~18MB → ~0.9MB public), fewer font weights with `display: swap`, AVIF/WebP image pipeline, long-cache static headers, below-fold dynamic imports, Open Graph metadata, skip link, and LCP-priority floral/logo loading
- Admin Sharing / Settings / Team CTAs use proper buttons; wedding workspace panels restyled for brand consistency
- Google Drive root folder created by the app is named **Memory Drop** (was "Wedding Memories"); existing connected folders are unchanged
- Gallery **Load more** fetches the next page from `GET /api/weddings/[id]/media` and appends it to the grid, instead of navigating to a new cursor URL. Ordering is `createdAt` then `id`, so pages stay stable.

### Fixed

- Guest uploads no longer pass through `proxy.ts` (`/api` removed from the matcher). Matched routes were buffering bodies at ~10MB and silently truncating larger photos/videos; auth for APIs stays in route handlers, security headers stay in `next.config.ts`

---

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

- Open self-registration; no email verification or 2FA (login rate limiting and lockout landed in 0.1.1)
- No delete-wedding UI; Drive disconnect UX incomplete relative to role matrix
- Large originals still slow if downloaded; lightbox uses Drive thumbnails for view speed
- Not production-hardened for multi-instance rate limits or Google OAuth app verification
