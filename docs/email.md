# Email transactional service (Resend)

Tusch sends transactional email through [Resend](https://resend.com). This
document covers the one-time setup, the env vars, and how to add new
email types as the product grows.

## Why Resend
- 3 000 emails / month free (100 / day), no card required.
- React Email templates and decent deliverability.
- Simple SDK; we wrap it behind `EmailService` so the rest of the code
  never imports `resend` directly.

## One-time setup

### 1. Create the Resend account
1. Sign up at <https://resend.com/signup>.
2. No credit card required for the free tier.

### 2. Add the `tusch.mn` domain in Resend
1. Dashboard → **Domains → Add Domain**.
2. Name: `tusch.mn`, Region: `eu-west-1`.
3. Resend prints three DNS records to add (SPF, DKIM, MX).

### 3. Wire up DNS in Cloudflare
1. Cloudflare dashboard → `tusch.mn` → **DNS**.
2. Add each of the three records exactly as printed by Resend.
3. **Important:** click the orange cloud → grey on every Resend record
   so Cloudflare does **not** proxy them. Resend needs the real values
   visible.
4. Save.

### 4. Verify in Resend
1. Resend → Domains → `tusch.mn` → **Verify DNS Records**.
2. Propagation usually completes in 1–5 minutes via Cloudflare. The
   three rows should switch to **Verified**.

### 5. Generate the API key
1. Resend → **API Keys → Create API Key**.
2. Name: `tusch-api-production` (or matching env).
3. Permission: **Sending access** (full access not needed).
4. Copy the key immediately — it is only shown once.

## Environment variables

Add the following to `apps/api/.env` (or the deployment secret store):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@tusch.mn
RESEND_FROM_NAME=Tusch
```

The Zod schema in `apps/api/src/config/env.schema.ts` enforces:
- `RESEND_API_KEY` must start with `re_` when set.
- `RESEND_FROM_EMAIL` becomes required if `RESEND_API_KEY` is set.
- `RESEND_FROM_NAME` defaults to `Tusch`.

Absence of `RESEND_API_KEY` is **allowed**: the app boots, every
`emailService.send()` call returns `null` and logs a `[email-skipped]`
warning. This is the right behaviour for local dev and CI.

## Production health check

```
GET /admin/email/health
```

Returns:

```json
{
  "configured": true,
  "fromEmail": "noreply@tusch.mn",
  "fromName": "Tusch",
  "domain": "tusch.mn"
}
```

Guarded by `JwtAuthGuard + AdminGuard`. No real email is sent — use this
in prod smoke checks instead of triggering a verification flow.

## Adding a new transactional email

1. Add a typed method to `EmailService` (e.g.
   `sendShippingNotification(...)`).
2. Inside, build the HTML/text — keep templates in
   `apps/api/src/modules/email/templates/` (landing in US-E2).
3. Call `this.send({ to, subject, html, text, tags })` and surface the
   returned id in your service log.
4. Tag the message (`{ name: 'flow', value: 'shipping' }`) so it is
   filterable in the Resend dashboard.

The current stubs (`sendEmailVerification`, `sendPasswordReset`,
`sendOfferNotification`, `sendMessageNotification`) intentionally throw
`Not implemented yet — US-E2` so callers compile against the final
signature today.

## Debugging in production

- **Resend dashboard → Logs**: every send shows status, recipient,
  bounce reason. Filter by tag.
- **API logs**: each send emits a `[email-sent]` / `[email-failed]` /
  `[email-skipped]` line with the subject and Resend id.
- **Cloudflare DNS analytics**: if DKIM starts failing after a record
  edit, this is the fastest place to confirm.

## Free-tier limits and alerts

- Hard cap: 3 000 emails / month, 100 / day, 2 / second.
- Resend has a "Usage" panel. Configure an alert at 80 % to upgrade
  before bounces happen.
- If we approach the daily cap during a burst (e.g. mass notification),
  rate-limit on our side rather than let Resend reject.

## Related docs
- US-E1 (this file): infrastructure + EmailService wrapper.
- US-E2 (upcoming): React Email templates + branching from auth flows.
- US-E3 (upcoming): notification emails for offers and messages.
