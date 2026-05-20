# Auth methods (US-A4)

Tusch accounts can authenticate by three independent factors. The unified
`/settings/security` page is the single place a user inspects or changes
them; this doc is the maintenance reference.

## The three factors

| Factor          | Login path                              | Linked at                                            | Storage                                        |
|-----------------|-----------------------------------------|------------------------------------------------------|------------------------------------------------|
| Email + password | `POST /auth/login`                     | `POST /auth/register` or first OAuth login          | `User.email` + bcrypt `User.password`          |
| Phone (Firebase) | `POST /auth/phone/login`               | `POST /auth/phone/link` (existing user)             | `User.phone` + `User.firebaseUid`              |
| OAuth (Google)   | `POST /auth/oauth-login`               | First Google sign-in via NextAuth                   | `User.email` + placeholder `User.password`     |

OAuth users get a random placeholder password so the column constraint is
satisfied — but it is never returned by the auth-methods endpoint and the
`change-password` flow rejects it (current password check fails). Adding
a real password for an OAuth-only account is a follow-up (out of scope
for US-A4).

## `GET /users/me/auth-methods`

Returns a per-user snapshot used by the security page and the
SecurityImprovementBanner. **Anti-IDOR**: the route only ever reads the
caller's own user via the JWT — there is no `:id` parameter.

```json
{
  "email": { "value": "darkhaa@example.com", "verified": true },
  "phone": { "value": "+97699112233", "verified": true },
  "hasPassword": true,
  "canUnlinkEmail": true,
  "canUnlinkPhone": true
}
```

- `canUnlinkEmail` / `canUnlinkPhone` are `true` only when removing that
  factor would still leave the user with at least one working login.
- Email alone (without a password) does **not** count as a login method
  here — it can verify ownership but cannot be used to sign in.
- Both flags are enforced server-side in `AuthService.unlinkPhoneFromUser`
  and (eventually) the email-removal endpoint. The UI mirrors them only
  for affordance — never trust the client.

## When each method is used

- **Login**: `/auth/login` (email+pw), `/auth/phone/login` (Firebase ID
  token), `/auth/oauth-login` (Google profile from NextAuth callback).
- **Link** (already authenticated, adding a factor):
  `/auth/phone/link`. No analogous endpoint exists for email-on-phone-
  account migration yet — punted to the next phase.
- **Unlink**: `/auth/phone/unlink`. Refuses with 400
  `Cannot unlink phone — it is the only auth method on this account`
  when the user has no `email + password` pair.

## Adding a new OAuth provider

1. Configure the provider in NextAuth (`apps/web/src/app/api/auth/[...nextauth]/route.ts`).
2. Make sure the provider exposes a verified email — the `oauthLogin`
   service in `apps/api/src/modules/auth/auth.service.ts` upserts on
   `email`, so providers that don't return a verified email will collide
   with manually registered accounts.
3. Surface the provider in the "Linked accounts" UI of the security page
   (not built yet — when this section lands, it should consume
   `/users/me/auth-methods` extended with an `oauthProviders` array).

## Debugging in production

- **Phone**: `apps/api/src/modules/firebase/firebase.service.ts` logs
  `[firebase-skipped]` when env is missing. Resend dashboard isn't
  involved — phone is fully Firebase.
- **Email**: see `docs/email.md` for Resend setup + the
  `/admin/email/health` endpoint.
- **OAuth callback**: NextAuth logs go through the Next.js server
  output; misconfigured `NEXTAUTH_URL` is the usual culprit.

## Related docs

- `docs/email.md` — Resend setup, templates, US-E1/E2/E3 background.
- `docs/firebase-phone-auth.md` — Firebase Phone Auth setup (US-A1).
