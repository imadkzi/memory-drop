# Roadmap

Living plan for Memory Drop after the `0.1.0` MVP. Ordered by what unblocks real events first, then scale and product expansion.

See also: [CHANGELOG.md](./CHANGELOG.md) · [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## Now — ship-ready hardening

Work that should land before trusting the app with a real wedding / event day.

### Auth & access

- [x] Login / signup rate limiting and basic lockout
- [ ] Email verification before creating events (or invite-only registration)
- [ ] Stronger password policy (or passkeys)
- [ ] Optional 2FA for owners
- [ ] Close or gate open self-signup (invite codes / allowlist)

### Reliability & ops

- [x] Production deploy (Railway + managed Postgres, env secrets, HTTPS, `prisma migrate deploy`)
- [x] Google Cloud OAuth: production redirect URI + owner as test user (`drive.file`; full verification optional for a private wedding)
- [x] Keep `/api` (especially uploads) out of `proxy.ts` matcher so large guest files are not body-buffered/truncated
- [ ] Raise day-of upload rate limits via env (venue WiFi often shares one IP; defaults are too tight for ~20 guests)
- [x] Phone smoke test on the production URL (photo + video, cellular and WiFi)
- [ ] Health check + structured error monitoring (e.g. Sentry)
- [ ] Replace in-memory upload rate limit with shared store (Redis) for multi-instance — skip while on a single replica
- [ ] Backup / restore story for Postgres metadata (Drive files stay in the owner’s Drive)

### Admin completeness

- [ ] Disconnect Google Drive (owner) with clear UX when uploads would fail
- [ ] Delete event / wedding (owner) — soft-delete metadata; document Drive folder behaviour
- [x] Bulk download as zip (or async zip job) for selected / all media
- [x] Clear empty / error states when Drive is not connected before first guest upload
- [x] Brand Drive root folder as `Memory Drop` for newly connected accounts
- [x] Prefetch / cache large previews more aggressively for gallery + lightbox
- [x] Lightbox photos use originals (with HEIC fallback); videos start via byte ranges

### Guest experience

- [ ] Mobile camera / library UX polish (progress, retries, offline-ish failure messages)
- [x] Upload size guidance in human units (MB), not only byte settings
- [ ] Optional guest caption / message field (still no guest gallery)

---

## Next — stronger product

### Sharing & day-of

- [ ] Printable QR + sign PDF template
- [ ] Short vanity / branded guest path (optional custom slug)
- [ ] “Pause uploads” one-tap from dashboard (already have setting — surface it more)
- [ ] Day-of checklist: Drive connected, link copied, QR downloaded, event date set, rate limits raised

### Team & accounts

- [x] Invite flow with copyable link (create password or sign in, then accept)
- [ ] Email delivery for invites (when a domain / Resend etc. is available)
- [ ] Transfer ownership
- [ ] Activity log (who deleted / downloaded / regenerated link)

### Media

- [ ] Filter + search by date / type / filename
- [ ] Favourites / “must keep” flags for couples
- [ ] Video scrubbing / better video posters in grid
- [ ] Soft-delete trash with restore window before Drive delete

### Brand & marketing

- [x] Privacy policy and terms, linked from the homepage, signup, and guest upload
- [x] Performance / SEO baseline: WebP assets, font swap, robots + sitemap, Open Graph metadata
- [x] Dedicated OG / Twitter share images and JSON-LD
- [x] Marketing redesign with Motion, quieter admin chrome, organized brand/photo/icon assets
- [ ] Real photo assets pipeline for landing (licensed photography beyond current set)
- [ ] Pricing / waitlist page if going commercial

---

## Later — platform

Out of MVP scope; revisit when core events are stable.

- [ ] Alternate storage providers (S3, Cloudflare R2) behind `StorageProvider`
- [ ] Multi-event packages (engagement + wedding + brunch)
- [ ] Planner agency accounts (many events under one org)
- [ ] Payments / subscriptions
- [ ] Native share sheet / PWA install for guests
- [ ] Public guest gallery (explicitly opt-in — breaks current product principle)
- [ ] AI tagging / highlights (privacy review required)
- [ ] Native iOS / Android apps

---

## Explicitly not planned (unless product principle changes)

- Guests browsing other guests’ uploads by default
- Exposing Google Drive folder links to guests
- Social feed, comments threads, or public discovery

---

## Suggested release cadence

| Version | Theme |
|---|---|
| **0.1.1** | Shipped 2026-10-07: auth lockout, copyable invites, zip download, legal pages, Railway deploy, upload proxy fix, gallery paging |
| **0.1.2** | Shipped 2026-10-10: marketing redesign + Motion, brand/SEO assets, OG images, lightbox byte-range / full photo playback |
| **0.2.0** | Day-of polish (print QR, Drive disconnect/delete, checklist, raise upload rate limits) |
| **0.3.0** | Email invites + activity log + media tooling |
| **1.0.0** | Production-trusted: verified OAuth, monitoring, shared rate limits, closed signup |

Update this file when priorities shift; move shipped items into `CHANGELOG.md`.
