# ReferKaro Production Launch Runbook

This runbook covers the remaining production actions for `https://referkaro.app`. The application is deployed, but it is **not launch-ready** until every exit criterion below passes.

## 0. Security Before Launch

The GitHub, registrar, and Testmail credentials previously shared in chat must be rotated before public launch. Store replacement credentials only in the relevant provider dashboard or an approved secret manager. Never place secrets in Git URLs, repository files, issue text, or terminal commands that may be logged.

## 1. Enable Testmail in Production

1. Open Vercel, select the `referkaro` project, and open **Settings > Environment Variables**.
2. Add `TESTMAIL_API_KEY` for **Production** and mark it sensitive.
3. Confirm these existing Production values:
   - `TESTMAIL_NAMESPACE=rnuj6`
   - `TESTMAIL_TAG_PREFIX=referkaro`
   - `TESTMAIL_POLL_LIMIT=25`
4. Redeploy Production so the deployment receives the new environment value.
5. Pull production metadata locally without displaying secret values:

```powershell
vercel env pull .env.vercel.production.local --environment=production --yes
npm run check:vercel-env
npm run check:launch-env -- --env-file .env.vercel.production.local --allow-redacted-sensitive
```

Exit criteria: both checks pass the Testmail requirements, and an unauthenticated request to `/api/cron/testmail-inbound` still returns HTTP 401.

## 2. Schedule Testmail Polling

The protected route is `https://referkaro.app/api/cron/testmail-inbound`. The scheduler must send `Authorization: Bearer <CRON_SECRET>` without exposing the value in logs.

Choose one production scheduler:

- Use a Vercel plan that supports the required polling interval, then add the route to `vercel.json` at the supported cadence.
- Use an external scheduler with encrypted headers and a 2-5 minute cadence.

Do not use a daily schedule for user-facing proxy mail. Confirm scheduler delivery from provider logs, then send one message to a newly generated Testmail proxy address.

Exit criteria: the application changes to `referred`, the candidate receives one forwarded message, the proxy record becomes inactive, and a repeated poll does not forward the message again.

## 3. Activate and Verify Razorpay Live Mode

1. In Razorpay, complete live-mode activation and generate live API credentials.
2. In Vercel Production environment variables, replace:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` with the `rzp_live_...` key ID.
   - `RAZORPAY_KEY_SECRET` with the matching live secret and mark it sensitive.
3. In the Razorpay live dashboard, create a webhook:
   - URL: `https://referkaro.app/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`
   - Secret: the same value stored as `RAZORPAY_WEBHOOK_SECRET` in Vercel.
4. Redeploy Production after changing environment values.
5. Run a low-value live token purchase with an account created only for launch testing.

Verify in Razorpay and Supabase:

- The Razorpay payment is captured.
- The matching `transactions` row is successful and contains the expected order/payment identifiers.
- The profile token balance increases exactly once.
- Re-delivering the webhook does not credit tokens a second time.
- A failed payment remains uncredited.

Repeat the test for the selected-application success-fee path. Verify the application becomes `referred`, one proxy email record is created, and the confirmation notification is sent.

Exit criteria: both payment paths reconcile exactly once in live mode, and the failed-payment path produces no credit or referral side effect.

## 4. Configure Domain Email DNS

1. In Resend, add or open `referkaro.app` and retrieve the exact sending-domain records. The current send-only API key cannot read these records.
2. If domain inboxes are required, retrieve Resend's exact custom receiving records or choose a mailbox provider. Do not invent MX, SPF, or DKIM values.
3. In Name.com DNS, add the provider-supplied records and a DMARC policy for `_dmarc.referkaro.app`.
4. Wait for public DNS propagation and provider verification.
5. Verify:

```powershell
npm run check:dns-email
npm run check:resend-domain -- --env-file .env.vercel.production.local
```

Exit criteria: public MX, SPF, DKIM, and DMARC are present as required, Resend reports the domain verified, and test messages from the configured `EMAIL_FROM` reach an external inbox.

## 5. Final Release Gate

Pull current Production environment metadata, run every gate, then build from the exact Git revision intended for deployment:

```powershell
vercel env pull .env.vercel.production.local --environment=production --yes
$env:LAUNCH_ENV_FILE = '.env.vercel.production.local'
$env:ALLOW_REDACTED_SENSITIVE_ENV = '1'
npm run check:launch
npm run build -- --webpack
git status -sb
```

The release can be called launch-ready only when:

- Every `check:launch` gate passes with zero failures.
- The build exits successfully and its output has no unresolved warnings.
- `git status -sb` shows the launch revision synchronized with its remote branch and no unintended changes.
- Production has been redeployed from that revision.
- Public smoke tests pass after deployment.
- Live Razorpay transaction evidence and Testmail forwarding evidence have been recorded without storing secrets or personal payment data in Git.
