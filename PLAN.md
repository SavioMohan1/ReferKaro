# Plan: Production Readiness Step 20 - Testmail Proxy Mail Integration

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Record this focused Testmail proxy-mail task before execution.
* `[POSSIBLE MODIFY]` `src/app/api/webhooks/inbound-email/route.ts` - Reuse or extract inbound email processing if Testmail polling should feed the existing referral-proof flow.
* `[POSSIBLE CREATE]` `src/app/api/cron/testmail-inbound/route.ts` - Add a protected cron endpoint that polls Testmail and processes received proxy emails.
* `[POSSIBLE CREATE]` `src/lib/testmail/*` or `src/lib/email/*` - Add layered services for Testmail fetch/normalization if needed.
* `[POSSIBLE MODIFY]` `.env.example`, `scripts/check-launch-env.js`, `scripts/check-vercel-env-names.js`, and launch checks - Add required Testmail env verification without printing secrets.
* `[POSSIBLE MODIFY]` `docs/launch-readiness-audit.md` - Record verified Testmail state and remaining blockers.

## 2. Dependencies to be Installed
* None planned. Use built-in `fetch` and existing dependencies unless official Testmail docs require otherwise.

## 3. Test Plan
* Run `git status -sb` before changes.
* Inspect current inbound-email/proxy-email implementation and launch check scripts from disk.
* Use current official Testmail API documentation before writing API syntax.
* Verify the Testmail API key only by presence/length or live API status; never print it.
* Add or update tests/checks for any new env variables.
* Run `npm run check:secret-hygiene`.
* Run `npm run build -- --webpack` and read the output.
* Run relevant launch checks and keep launch status failing until all production blockers are resolved.
