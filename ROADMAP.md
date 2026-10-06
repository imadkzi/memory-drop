# Roadmap

Living plan for Memory Drop after the `0.1.0` MVP. Ordered by what unblocks real weddings first, then scale and product expansion.

See also: [CHANGELOG.md](./CHANGELOG.md) · [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## Now — ship-ready hardening

Work that should land before trusting the app with a real wedding day.

### Auth & access

- [ ] Login / signup rate limiting and basic lockout
- [ ] Email verification before creating weddings (or invite-only registration)
- [ ] Stronger password policy (or passkeys)
- [ ] Optional 2FA for owners
- [ ] Close or gate open self-signup (invite codes / allowlist)

### Reliability & ops

- [ ] Production deploy (hosting, managed Postgres, env secrets, HTTPS)
- [ ] Google Cloud OAuth consent screen / verification for `drive.file`
- [ ] Health check + structured error monitoring (e.g. Sentry)
- [ ] Replace in-memory upload rate limit with shared store (Redis) for multi-instance
- [ ] Backup / restore story for Postgres metadata (Drive files stay in the owner’s Drive)

### Admin completeness

- [ ] Disconnect Google Drive (owner) with clear UX when uploads would fail
- [ ] Delete wedding (owner) — soft-delete metadata; document Drive folder behaviour
- [ ] Bulk download as zip (or async zip job) for selected / all media
- [ ] Clear empty / error states when Drive is not connected before first guest upload
- [ ] Prefetch / cache large previews more aggressively for gallery + lightbox

### Guest experience

- [ ] Mobile camera / library UX polish (progress, retries, offline-ish failure messages)
- [ ] Upload size guidance in human units (MB), not only byte settings
- [ ] Optional guest caption / message field (still no guest gallery)

---

## Next — stronger product

### Sharing & day-of

- [ ] Printable QR + sign PDF template
- [ ] Short vanity / branded guest path (optional custom slug)
- [ ] “Pause uploads” one-tap from dashboard (already have setting — surface it more)
- [ ] Day-of checklist: Drive connected, link copied, QR downloaded, event date set

### Team & accounts

- [ ] Invite flow that emails people who do not yet have an account
- [ ] Accept invite → create password → join wedding
- [ ] Transfer ownership
- [ ] Activity log (who deleted / downloaded / regenerated link)

### Media

- [ ] Filter + search by date / type / filename
- [ ] Favourites / “must keep” flags for couples
- [ ] Video scrubbing / better video posters in grid
- [ ] Soft-delete trash with restore window before Drive delete

### Brand & marketing

- [x] Privacy policy and terms, linked from the homepage, signup, and guest upload
- [ ] Real photo assets pipeline for landing (licensed wedding photography)
- [ ] Pricing / waitlist page if going commercial
- [ ] SEO / OG images for marketing pages only (admin stays noindex)

---

## Later — platform

Out of MVP scope; revisit when core weddings are stable.

- [ ] Alternate storage providers (S3, Cloudflare R2) behind `StorageProvider`
- [ ] Multi-event packages (engagement + wedding + brunch)
- [ ] Planner agency accounts (many weddings under one org)
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
| **0.1.x** | MVP bugfixes, auth hardening, deploy |
| **0.2.0** | Day-of polish (zip download, print QR, Drive disconnect/delete) |
| **0.3.0** | Invites + activity log + media tooling |
| **1.0.0** | Production-trusted: verified OAuth, monitoring, rate limits, closed signup |

Update this file when priorities shift; move shipped items into `CHANGELOG.md`.
