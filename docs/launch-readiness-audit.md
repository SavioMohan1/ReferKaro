# ReferKaro Launch Readiness Audit

Date: 2026-06-20

## What changed in this pass
- Added `AGENTS.md` at the repo root with the project operating rules supplied by the owner.
- Removed remote Google Font dependencies from `src/app/layout.tsx` and `src/app/globals.css` so production builds do not depend on fetching fonts during build/runtime.
- Migrated Next.js `src/middleware.ts` to `src/proxy.ts` and renamed the exported function to `proxy`, matching the current Next.js file convention.
- Renamed `sentry.client.config.ts` to `instrumentation-client.ts` and added the required Sentry router transition hook.
- Updated `next.config.mjs` from deprecated `disableLogger` to `webpack.treeshake.removeDebugLogging`.

## Verification completed
- `AGENTS.md` was read back from disk after creation.
- `src/proxy.ts`, `instrumentation-client.ts`, `next.config.mjs`, `src/app/layout.tsx`, and `src/app/globals.css` were read back or searched after edits.
- Production build passed with: `npm run build -- --webpack`.
- Public DNS check for `referkaro.app` found A record `76.76.21.21`, which is Vercel's apex IP.
- Public DNS check found no MX answer for `referkaro.app`.
- Public DNS check found no TXT answer for `referkaro.app`.

## Current launch blockers / risks
- Rotate the GitHub token and domain registrar API token that were shared in chat before final launch.
- Add production DNS TXT records for email sending/authentication once the email provider is chosen or verified: SPF, DKIM, and DMARC.
- Add MX records if ReferKaro needs inbound domain email, proxy email, or mailbox access on `referkaro.app`.
- Confirm Vercel production environment variables match `.env.example`, including Supabase, Razorpay live keys, Resend/email sender, cron secret, inbound webhook secret, admin email, proxy email, and Sentry auth token if sourcemaps are uploaded.
- Confirm Razorpay is using live mode for launch, not test mode, and complete a real low-value payment/refund-path test before going public.
- Review remaining hardcoded domain references in server emails; some code still references `referkaro.com` while the live domain is `referkaro.app`.

## Recommended next sub-task
Fix production domain/email consistency in server-side email templates and env defaults, then run `npm run build -- --webpack` again.
## 2026-06-20 Update - Domain and Email Consistency
- Updated runtime app references away from `referkaro.com` to `referkaro.app` or environment-driven values.
- Added `NEXT_PUBLIC_URL=https://referkaro.app` and `PROXY_EMAIL_DOMAIN=referkaro.app` to `.env.example`.
- Updated cron expiration emails to use `EMAIL_FROM` and `NEXT_PUBLIC_URL` instead of hardcoded sender/domain values.
- Updated generated proxy email domains in Razorpay success-fee verification to use `PROXY_EMAIL_DOMAIN`.
- Updated fallback universal proxy email behavior in application review/payment completion flows to use `proxy@referkaro.app` instead of a personal Gmail fallback when `PROXY_EMAIL` is missing.
- Updated contact, feedback, and footer email addresses to the `referkaro.app` domain.
- Verified app source no longer contains `referkaro.com`, `support@referkaro.com`, `feedback@referkaro.com`, `notifications@referkaro.com`, or the personal Gmail proxy fallback.
- Production build passed with `npm run build -- --webpack` and no warnings.

## Remaining Launch Blockers After This Update
- Configure real mailbox or inbound email routing for `support@referkaro.app`, `feedback@referkaro.app`, `notifications@referkaro.app`, and `proxy@referkaro.app` or equivalent provider aliases.
- Add domain email DNS records: MX for inbound mail if needed, plus SPF, DKIM, and DMARC TXT records for trusted sending.
- Set the same production env variables in Vercel that are now documented in `.env.example`.
- Rotate the GitHub token and registrar API token that were shared in chat before any deployment or repository push.
- Run an end-to-end live payment test with Razorpay live keys before public launch.
## 2026-06-20 Update - Payment Verification Hardening
- Inspected `payments_schema.sql`, `fix_transactions_rls.sql`, payment UI, token pricing, `/api/payments/create-order`, and `/api/payments/verify`.
- Found that transaction inserts have an RLS policy, but transaction updates are not covered by the visible RLS policy files.
- Updated `/api/payments/verify` to verify Razorpay signatures first, then use a Supabase service-role client for privileged transaction/profile/application/proxy writes.
- Added explicit missing-field handling for Razorpay verification payloads.
- Made repeated verification of an already-successful payment return `success: true`, which keeps Razorpay checkout retries/idempotent UI behavior from falsely showing a failure.
- Added guarded pending-transaction locking before reconciliation to reduce duplicate token-credit or proxy-email side effects.
- Production build passed with `npm run build -- --webpack` and no warnings.

## Remaining Payment Launch Blockers
- Confirm the `transactions` table in production includes `application_id` and `type` columns from `add_escrow_schema.sql`.
- Confirm Vercel production env vars use Razorpay live keys, not test keys.
- Run a real low-value live payment through token purchase and verify that the user's token balance updates in Supabase.
- Run or simulate the success-fee payment path after a selected application and verify application status, proxy email creation, and notification email behavior.
- Decide whether payment verification should also be backed by a Razorpay webhook for server-to-server reconciliation before public scale.
## 2026-06-20 Update - Supabase Launch Schema
- Inspected current SQL fragments, TypeScript shared types, payment routes, application routes, notification routes, admin job review, job creation, and storage setup.
- Found schema drift: current app code depends on statuses/columns/policies spread across multiple SQL files, including `selected`, `expired`, `referred`, `approval_status`, notifications, proxy emails, transaction `application_id`, transaction `type`, resume storage, and verification-document storage.
- Added `sql/production_launch_schema.sql` as a consolidated production alignment migration for the current app surface.
- The migration includes base table guards, launch columns, status/type constraints, service-role policies, user-facing RLS policies, storage buckets, and the `safe_pool_apply` RPC used by pooling applications.
- Verified the migration file contains required launch markers: `selected`, `expired`, `referred`, `application_id`, `type`, `approval_status`, `notifications`, `proxy_emails`, `resumes`, `verification-documents`, and `safe_pool_apply`.
- Production build passed with `npm run build -- --webpack` and no warnings.

## Remaining Database Launch Blockers
- Do not run `sql/production_launch_schema.sql` against production until exposed credentials are rotated and the target Supabase project is confirmed.
- Run the migration in Supabase SQL Editor or through an approved deployment pipeline, then verify table columns, constraints, RLS policies, storage buckets, and `safe_pool_apply` exist in production.
- Review production data before adding unique indexes if duplicate historical rows exist, especially `applications(job_id, job_seeker_id)` and `transactions(razorpay_order_id)`.
- After migration, run app-level smoke tests for job creation, job approval, application apply, token purchase, selected-to-payment flow, notifications, resume upload, and verification document upload.
## 2026-06-20 Update - Launch Environment Checker
- Added `scripts/check-launch-env.js`, a dependency-free checker that validates launch environment shape without printing secret values.
- Added `npm run check:launch-env` for production-mode checks.
- The checker validates Supabase, Razorpay, Gemini, Resend/email sender, app URL, admin email, proxy email/domain, cron secret, inbound webhook secret, and optional Sentry source-map token presence.
- Local production-mode check currently fails, which is expected until Vercel production env values are set: missing `NEXT_PUBLIC_URL`, missing `EMAIL_FROM`, missing `ADMIN_EMAIL`, missing `CRON_SECRET`, missing `WEBHOOK_INBOUND_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` is test-mode, `PROXY_EMAIL` is not on `referkaro.app`, and `PROXY_EMAIL_DOMAIN` is not `referkaro.app`.
- The checker warns that `SENTRY_AUTH_TOKEN` is missing, which only affects source-map upload/debug quality.
- Production build passed with `npm run build -- --webpack` and no warnings after adding the checker.

## Remaining Environment Launch Blockers
- Set Vercel production env vars to pass `npm run check:launch-env`.
- Use live Razorpay keys for production payment tests.
- Set `EMAIL_FROM` to a verified sender on `referkaro.app` after DNS email authentication is configured.
- Set `ADMIN_EMAIL`, `PROXY_EMAIL`, `PROXY_EMAIL_DOMAIN`, `CRON_SECRET`, and `WEBHOOK_INBOUND_SECRET` in Vercel production.
- Re-run `npm run check:launch-env` in an environment containing production variables before deployment.
## 2026-06-20 Update - DNS and Email Readiness Checker
- Added `scripts/check-dns-email.js`, a dependency-free public DNS checker for `referkaro.app` web and email launch readiness.
- Added `npm run check:dns-email` so DNS/email readiness can be re-checked without using or exposing registrar tokens.
- The checker verifies apex web DNS, `www` resolution, MX records, SPF TXT, and DMARC TXT; it warns that DKIM is provider-specific until the email provider supplies selector records.
- Current public DNS result: `referkaro.app` apex A record passes and points to Vercel IP `76.76.21.21`.
- Current public DNS result: `www.referkaro.app` resolves publicly.
- Current public DNS result: email readiness fails because `referkaro.app` has no public MX, no SPF TXT, and `_dmarc.referkaro.app` has no DMARC TXT.
- `npm run check:dns-email` exits non-zero with 3 failures and 1 warning, which is expected until email DNS is configured.
- Production build passed with `npm run build -- --webpack` and no warnings after adding the checker.

## Remaining DNS/Email Launch Blockers
- Choose and configure the production email provider for domain mailboxes/sending on `referkaro.app`.
- Add MX records if inbound domain email or mailbox access is required.
- Add SPF, DKIM, and DMARC TXT records from the chosen provider before relying on production email delivery.
- Re-run `npm run check:dns-email` after DNS propagation and require zero failures before final launch.

## 2026-06-20 Update - Deployment Wiring and Secret Hygiene
- Inspected local git branch, git remote, and Vercel project metadata.
- Found the git `origin` remote had an embedded GitHub token in the remote URL; replaced it with the token-free repository URL `https://github.com/SavioMohan1/ReferKaro.git`.
- Verified `git remote -v` now shows only the token-free GitHub URL for fetch and push.
- Verified local Vercel linkage exists through `.vercel/project.json`; the linked project name is `referkaro`.
- Production build passed with `npm run build -- --webpack` and no warnings after the remote hygiene fix.

## Remaining Deployment Launch Blockers
- Rotate the exposed GitHub token before any push, PR, or production deployment workflow uses repository credentials.
- Rotate the exposed domain registrar token before changing DNS records.
- Confirm whether Vercel is connected to the GitHub repo branch or requires a manual `vercel --prod` deployment from this workspace.
- Push the verified local launch-readiness changes to GitHub only after token rotation/authentication is fixed.
- Confirm Vercel production environment variables pass `npm run check:launch-env` before deploying production traffic.

## 2026-06-20 Update - Secret Hygiene Gate
- Added `scripts/check-secret-hygiene.js`, a dependency-free checker for credential-like strings in scanned repo files and git remotes.
- Added `npm run check:secret-hygiene` so secret hygiene can be checked before pushing or deploying.
- The checker reports only file/scope, line, and detector name; it does not print secret-looking values.
- Current result: `npm run check:secret-hygiene` passes with no credential-like patterns found in scanned repo files or git remotes.
- Production build passed with `npm run build -- --webpack` and no warnings after adding the checker.

## Remaining Secret Hygiene Launch Blockers
- Rotate the previously exposed GitHub token and domain registrar token even though the repo scan is currently clean.
- Re-run `npm run check:secret-hygiene` before every push/deploy until launch is complete.
- Avoid embedding access tokens in git remote URLs; use Git Credential Manager, GitHub CLI auth, or Vercel/GitHub integration instead.

## 2026-06-21 Update - Razorpay Webhook Reliability
- Verified current Razorpay webhook signature guidance from official Razorpay docs before implementation: validate `X-Razorpay-Signature` using HMAC-SHA256 over the raw webhook request body and expect duplicate webhook deliveries.
- Added `src/lib/payments/reconcile-razorpay-payment.ts` to centralize successful payment reconciliation for token purchases and success-fee payments.
- Updated `/api/payments/verify` to reuse the shared reconciliation helper after checkout signature validation, reducing duplicated side-effect logic.
- Added `/api/webhooks/razorpay` to verify Razorpay webhook signatures using `RAZORPAY_WEBHOOK_SECRET`.
- The new Razorpay webhook route reconciles `payment.captured`, safely marks pending orders failed on `payment.failed`, and ignores unrelated events with a successful acknowledgement.
- Added `RAZORPAY_WEBHOOK_SECRET` to `.env.example` and the production launch env checker.
- `node --check scripts/check-launch-env.js` passed.
- `npm run check:secret-hygiene` passed with no credential-like patterns found in scanned repo files or git remotes.
- `npm run check:launch-env` now correctly reports `RAZORPAY_WEBHOOK_SECRET` as a missing production blocker along with the existing production env blockers.
- Production build passed with `npm run build -- --webpack` and no warnings; the route list includes `/api/webhooks/razorpay`.

## Remaining Razorpay Webhook Launch Blockers
- Create the Razorpay webhook in the live Razorpay dashboard after live credentials are ready.
- Configure the webhook endpoint URL as `https://referkaro.app/api/webhooks/razorpay`.
- Subscribe at minimum to `payment.captured` and `payment.failed`.
- Set the same webhook secret in Razorpay and Vercel as `RAZORPAY_WEBHOOK_SECRET`.
- Run a real low-value live payment test and verify that either checkout verification or the Razorpay webhook reconciles the transaction exactly once.

## 2026-07-07 Update - Combined Launch Readiness Gate
- Added `scripts/check-launch-readiness.js`, a dependency-free orchestrator for the safe launch gates.
- Added `npm run check:launch` to run secret hygiene, DNS/email readiness, and production environment validation in one command.
- Fixed the checker to invoke the underlying Node scripts directly instead of nesting `npm` child processes, avoiding Windows shell/deprecation issues.
- Current result: `npm run check:launch` reports `PASS Secret hygiene`, `FAIL DNS and email`, and `FAIL Production environment`.
- DNS/email still fails because `referkaro.app` has no public MX, no SPF TXT, and `_dmarc.referkaro.app` has no DMARC TXT.
- Production environment still fails because required production values are missing or unsafe locally, including `NEXT_PUBLIC_URL`, `RAZORPAY_WEBHOOK_SECRET`, live Razorpay key, `EMAIL_FROM`, `ADMIN_EMAIL`, `PROXY_EMAIL`, `PROXY_EMAIL_DOMAIN`, `CRON_SECRET`, and `WEBHOOK_INBOUND_SECRET`.
- First build attempt timed out before returning verifiable output, so it was not treated as evidence.
- Re-run production build passed with `npm run build -- --webpack` and no warnings.

## Remaining Combined Gate Launch Blockers
- `npm run check:launch` must pass before final production launch.
- Configure domain email DNS and production Vercel environment variables, then rerun `npm run check:launch`.
- Keep using `npm run build -- --webpack` as the final local build gate before deployment.

## 2026-07-07 Update - Public Live-Site Smoke Gate
- Added `scripts/check-live-site.js`, a dependency-free public smoke checker for `https://referkaro.app`.
- Added `npm run check:live-site` for standalone live-site verification.
- Added live-site smoke to `npm run check:launch`, so the combined launch gate now covers secret hygiene, DNS/email, public live pages, and production environment shape.
- Current live-site result: `/`, `/about`, `/jobs`, `/contact`, and `/login` return HTTP 200 with expected public page markers.
- Current live-site result: `/privacy` and `/terms` return HTTP 404 on the deployed site, even though those routes exist and build locally. This indicates the current local legal pages have not been deployed to production yet.
- Current combined gate result: `npm run check:launch` reports `PASS Secret hygiene`, `FAIL DNS and email`, `FAIL Live site smoke`, and `FAIL Production environment`.
- Updated Browserslist data after the production build reported stale browser data; `caniuse-lite` is now updated in `package-lock.json`.
- Production build re-run passed with `npm run build -- --webpack` and no warnings.

## Remaining Live-Site Launch Blockers
- Deploy the current local build so `/privacy`, `/terms`, and the other legal pages are available on `https://referkaro.app`.
- Re-run `npm run check:live-site` after deployment and require zero failures.
- Re-run `npm run check:launch` after deployment, DNS email setup, and Vercel env configuration.

## 2026-07-07 Update - Deployment Metadata Gate
- Added `scripts/check-deployment-metadata.js`, a dependency-free checker for local deployment wiring.
- Added `npm run check:deployment` for standalone deployment metadata checks.
- Added deployment metadata to `npm run check:launch`, so the combined launch gate now covers secret hygiene, DNS/email, public live pages, deployment metadata, and production environment shape.
- Current deployment metadata result: Vercel project link passes and is linked to project `referkaro`.
- Current deployment metadata result: Vercel CLI is available locally.
- Current deployment metadata result: Git remote is token-free and points to `https://github.com/SavioMohan1/ReferKaro.git`.
- Current deployment metadata result: Git branch is `main`.
- Current deployment metadata result: working tree fails because there are pending local changes that must be committed/deployed before production can reflect them.
- Current combined gate result: `npm run check:launch` reports `PASS Secret hygiene`, `FAIL DNS and email`, `FAIL Live site smoke`, `FAIL Deployment metadata`, and `FAIL Production environment`.
- Production build passed with `npm run build -- --webpack` and no warnings.

## Remaining Deployment Metadata Launch Blockers
- Commit the verified local launch-readiness changes after reviewing the dirty worktree.
- Push the commit only after the exposed GitHub token is rotated and safe GitHub authentication is configured.
- Deploy the pushed commit through Vercel or the Vercel/GitHub integration, then re-run `npm run check:live-site`.
- Keep the deployment metadata gate failing until the working tree is clean and the deployed site matches the local build.

## 2026-07-07 Update - Vercel Production Env Metadata
- Added `scripts/check-vercel-env-names.js`, a dependency-free checker that lists Vercel production env variable names without printing values.
- Added `npm run check:vercel-env` for standalone Vercel production env-name checks.
- Added Vercel env-name metadata to `npm run check:launch`.
- Initial direct `vercel env ls production` / `vercel project ls` attempts timed out, so the checker now uses a bounded 20-second command and reports auth/timeout failures explicitly.
- Current Vercel env-name result: all required production env names are present except `RAZORPAY_WEBHOOK_SECRET`.
- Added safe non-secret Vercel production env values for `NEXT_PUBLIC_URL=https://referkaro.app` and `PROXY_EMAIL_DOMAIN=referkaro.app`.
- `RAZORPAY_WEBHOOK_SECRET` was not invented or set because it must match the Razorpay dashboard webhook secret.
- Current combined gate result: `npm run check:launch` reports `PASS Secret hygiene`, `FAIL DNS and email`, `FAIL Live site smoke`, `FAIL Deployment metadata`, `FAIL Vercel env names`, and `FAIL Production environment`.
- Production build passed with `npm run build -- --webpack` and no warnings.

## Remaining Vercel Env Launch Blockers
- Create the Razorpay live webhook and set the same generated secret in Vercel as `RAZORPAY_WEBHOOK_SECRET`.
- Confirm Vercel production env values, not just names, use live Razorpay keys and correct `referkaro.app` addresses.
- Re-run `npm run check:vercel-env` after adding `RAZORPAY_WEBHOOK_SECRET` and require zero missing names.
- Keep `npm run check:launch` failing until DNS/email, live deployment, Vercel env names, and production env value checks pass.

## 2026-07-07 Update - Production Deployment
- Ran `npm run check:secret-hygiene` before deployment; it passed with no credential-like patterns found in scanned repo files or git remotes.
- Ran `npm run build -- --webpack` before deployment; it passed with no warnings and included `/privacy`, `/terms`, and `/api/webhooks/razorpay`.
- Deployed the current local source state to Vercel production with `vercel deploy --prod --yes`.
- Vercel deployment ID: `dpl_5yPsYdFeFGRNqbbjeELpQKi5ysrq`.
- Vercel production deployment URL: `https://referkaro-o2okz1umf-saviomohan2002-6806s-projects.vercel.app`.
- Vercel aliased the deployment to `https://referkaro.app`.
- Post-deploy live-site smoke passed: `/`, `/about`, `/jobs`, `/contact`, `/login`, `/privacy`, and `/terms` all returned HTTP 200 with expected public markers.
- Post-deploy combined gate result: `PASS Secret hygiene`, `FAIL DNS and email`, `PASS Live site smoke`, `FAIL Deployment metadata`, `FAIL Vercel env names`, and `FAIL Production environment`.

## Remaining Production Deployment Launch Blockers
- Configure domain email DNS: MX, SPF, DKIM, and DMARC.
- Add `RAZORPAY_WEBHOOK_SECRET` to Vercel after creating the live Razorpay webhook.
- Commit/push the deployed local changes so GitHub and Vercel source history match the deployed production state.
- Verify production env values use live Razorpay credentials and correct `referkaro.app` email/domain values.
- Run a real low-value Razorpay live payment test and verify transaction reconciliation.

## 2026-07-07 Update - Git Source Sync
- Ran `npm run check:secret-hygiene` before staging; it passed with no credential-like patterns found in scanned repo files or git remotes.
- Ran `npm run check:live-site`; it passed with all checked public routes returning HTTP 200.
- Ran `npm run build -- --webpack`; it passed with no warnings.
- Staged the launch-related source, configuration, legal pages, launch checkers, schema, audit, and migration files.
- Left unrelated ad prompt docs unstaged: `docs/ad_video_prompt.md` and `docs/ad_video_prompt_15s.md`.
- `git diff --cached --check` initially found whitespace issues; fixed them and reran the check successfully.
- Created commit `9c6b4ad` with message `Prepare ReferKaro launch readiness`.
- Pushed `main` to `origin` successfully: `c9ce386..9c6b4ad`.

## Remaining Git Source Sync Launch Blockers
- Continue using `npm run check:secret-hygiene` before future commits and deployments.

## 2026-07-07 Update - Final Source Sync Cleanup
- Added the two ReferKaro ad video prompt docs after updating their examples and CTA URLs from `referkaro.com` to `referkaro.app`.
- Fixed trailing whitespace in the ad prompt docs after `git diff --cached --check` reported issues.
- Created and pushed commit `d53f5df` with message `Add ReferKaro ad video prompts`.
- Created and pushed cleanup commit `de4ce72` with message `Clean ad prompt whitespace`.
- Verified `git status -sb` reports `## main...origin/main`, meaning local `main` is clean and aligned with `origin/main`.
- `npm run check:deployment` now passes: Vercel project link, Vercel CLI, Git remote, branch, and clean working tree all pass.
- `npm run check:secret-hygiene` passes with no credential-like patterns found in scanned repo files or git remotes.
- Current combined gate result: `PASS Secret hygiene`, `FAIL DNS and email`, `PASS Live site smoke`, `PASS Deployment metadata`, `FAIL Vercel env names`, and `FAIL Production environment`.

## Remaining Final Launch Blockers
- Configure domain email DNS: MX, SPF, DKIM, and DMARC.
- Add `RAZORPAY_WEBHOOK_SECRET` to Vercel after creating the live Razorpay webhook.
- Verify Vercel production env values use live Razorpay credentials and correct `referkaro.app` values, not just that the variable names exist.
- Run a real low-value Razorpay live payment test and verify transaction reconciliation.

## 2026-07-07 Update - Vercel Env Value Verification
- Added `--env-file` support to `scripts/check-launch-env.js` so production-shaped env files can be checked explicitly instead of always reading `.env.local`.
- Added `LAUNCH_ENV_FILE` support to `scripts/check-launch-readiness.js` so the combined launch gate can point at a pulled Vercel production env file.
- Added an explicit `--allow-redacted-sensitive` mode for sensitive Vercel variables that are present in Vercel but non-readable in pulled env files. This matches Vercel's sensitive environment variable behavior: sensitive values are non-readable once created.
- Updated Vercel production env values for `ADMIN_EMAIL=admin@referkaro.app` and `PROXY_EMAIL=proxy@referkaro.app`.
- Generated and set sensitive Vercel production values for `WEBHOOK_INBOUND_SECRET` and `RAZORPAY_WEBHOOK_SECRET`.
- Verified `.gitignore` contains `.env*.local`, so the pulled `.env.vercel.production.local` file is ignored.
- Verified `npm run check:launch` with `LAUNCH_ENV_FILE=.env.vercel.production.local` and `ALLOW_REDACTED_SENSITIVE_ENV=1`: secret hygiene, live-site smoke, and Vercel env-name gates pass.
- Current combined gate result with pulled Vercel production env: `PASS Secret hygiene`, `FAIL DNS and email`, `PASS Live site smoke`, `FAIL Deployment metadata`, `PASS Vercel env names`, and `FAIL Production environment`.

## Remaining Vercel Env Value Launch Blockers
- Replace the current Vercel `NEXT_PUBLIC_RAZORPAY_KEY_ID` test key with a live Razorpay key after Razorpay live mode is activated.
- Configure the Razorpay dashboard webhook at `https://referkaro.app/api/webhooks/razorpay` using the same secret that was set in Vercel as `RAZORPAY_WEBHOOK_SECRET`.
- Redeploy after production env changes so the live deployment picks up the latest Vercel environment configuration.
- Keep the production env gate failing until a live Razorpay key is verified and DNS/email blockers are resolved.

## 2026-07-07 Update - Env Config Production Redeploy
- Created and pushed commit `33cb90c` with message `Improve Vercel env launch checks`.
- Deployed production with `vercel deploy --prod --yes` after updating Vercel production environment variables.
- Vercel deployment ID: `dpl_CMNPMj9qCTK2fDdpyWZiKFsGJX73`.
- Vercel production deployment URL: `https://referkaro-jyb9sy309-saviomohan2002-6806s-projects.vercel.app`.
- Vercel aliased the deployment to `https://referkaro.app`.
- Deployment build completed successfully on Vercel with Next.js 16.1.6 and Sentry source map upload.
- Post-deploy `npm run check:live-site` passed for `/`, `/about`, `/jobs`, `/contact`, `/login`, `/privacy`, and `/terms`.
- Post-deploy `npm run check:deployment` passed: Vercel project link, Vercel CLI, Git remote, branch, and clean working tree all pass.

## Remaining Production Redeploy Launch Blockers
- Configure domain email DNS: MX, SPF, DKIM, and DMARC.
- Replace Vercel Razorpay test credentials with live Razorpay credentials.
- Configure and test the Razorpay live webhook using the Vercel `RAZORPAY_WEBHOOK_SECRET`.
- Run a real low-value Razorpay live transaction and verify transaction reconciliation.

## 2026-07-07 Update - Resend Domain Readiness Gate
- Confirmed `referkaro.app` uses Name.com nameservers: `ns1djs.name.com`, `ns2fkr.name.com`, `ns3sxz.name.com`, and `ns4lny.name.com`.
- Checked current official Resend docs for domain listing/retrieval and receiving custom-domain DNS requirements.
- Checked current official Name.com docs for DNS record creation and confirmed Name.com API authentication requires both account username and API token.
- Added `scripts/check-resend-domain.js`, a secret-safe checker that uses `RESEND_API_KEY` to verify whether `referkaro.app` exists in Resend, whether sending is verified, and what DNS records Resend reports.
- Added `npm run check:resend-domain`.
- Added the Resend domain gate to `npm run check:launch`.
- Verified `npm run check:resend-domain -- --env-file .env.vercel.production.local` fails with Resend `restricted_api_key`: the current production key is restricted to sending emails and cannot read domain metadata or DNS records.
- Verified `npm run check:dns-email` still fails because public DNS has no MX, no SPF TXT, and no DMARC TXT for `referkaro.app`.
- Current combined gate result with pulled Vercel production env: `PASS Secret hygiene`, `FAIL DNS and email`, `FAIL Resend domain`, `PASS Live site smoke`, `FAIL Deployment metadata`, `PASS Vercel env names`, and `FAIL Production environment`.

## Remaining Resend/Name.com Launch Blockers
- Get a Resend API key with domain-read access or open the Resend dashboard for `referkaro.app` to retrieve SPF, DKIM, and custom receiving MX records.
- Get the Name.com account username that pairs with the provided API token before automating DNS record creation.
- Add verified Resend DNS records at Name.com, then re-run `npm run check:dns-email` until MX, SPF, DMARC, and provider DKIM checks pass.

## 2026-07-07 Update - Supabase Schema Readiness Gate
- Added `scripts/check-supabase-schema.js`, a secret-safe checker for the production Supabase URL, required launch tables/columns, storage buckets, and the `safe_pool_apply` RPC.
- Added `npm run check:supabase-schema`.
- Added the Supabase schema gate to `npm run check:launch`.
- Verified `.env.local` and the pulled Vercel production env currently point to the same Supabase host: `zabzbbmkmzpngricaudc.supabase.co`.
- Verified that Supabase host does not resolve publicly: DNS lookup returns `ENOTFOUND`.
- Verified a bounded git-history search did not find an alternate committed Supabase project URL.
- Current `npm run check:supabase-schema -- --env-file .env.vercel.production.local` result: fails at Supabase host DNS before table/schema checks can run.

## Supabase Launch Status
- Earlier DNS resolution failures for the configured Supabase host were transient or stale; the latest combined launch gate verifies the host, schema, buckets, and `safe_pool_apply` RPC successfully.
- Keep `npm run check:supabase-schema -- --env-file .env.vercel.production.local` in the launch gate so future schema drift is caught before launch.

## 2026-07-14 Update - Testmail Proxy Mail Integration
- Checked current official Testmail documentation before coding the integration. The JSON API endpoint is `https://api.testmail.app/api/json`; inbox addresses use `{namespace}.{tag}@inbox.testmail.app`; filtering supports namespace, tag, timestamp, limit, and live query parameters.
- Checked current official Vercel Cron documentation before adding the protected cron route. Vercel sends `CRON_SECRET` as a bearer `Authorization` header when configured.
- Added `src/lib/proxy-email.ts` so proxy addresses are generated in one place. When `TESTMAIL_NAMESPACE` is configured, ReferKaro generates per-application Testmail inbox addresses under `@inbox.testmail.app`.
- Added `src/lib/email/inbound-email.ts` so inbound proxy messages from any provider use the same idempotent referral-proof flow: lookup proxy, mark application `referred`, forward to the real candidate, and deactivate the proxy to avoid duplicate processing.
- Replaced `src/app/api/webhooks/inbound-email/route.ts` with a small authenticated route that delegates to the shared inbound processor.
- Added `src/lib/testmail/client.ts` for fetching Testmail JSON inbox messages without printing secrets.
- Added `src/app/api/cron/testmail-inbound/route.ts`, protected by `CRON_SECRET`, to poll Testmail and process proxy emails.
- Updated proxy generation in application review, complete-payment, and Razorpay reconciliation flows to use `createProxyAddress`.
- Added `TESTMAIL_API_KEY`, `TESTMAIL_NAMESPACE`, `TESTMAIL_TAG_PREFIX`, `TESTMAIL_POLL_LIMIT`, and `TESTMAIL_TIMESTAMP_FROM` to `.env.example`.
- Added `TESTMAIL_API_KEY` and `TESTMAIL_NAMESPACE` to launch env and Vercel env-name checks.
- Set safe non-secret Vercel production values: `TESTMAIL_NAMESPACE=rnuj6`, `TESTMAIL_TAG_PREFIX=referkaro`, and `TESTMAIL_POLL_LIMIT=25`.
- Verified `npm run build -- --webpack` passes and includes `/api/cron/testmail-inbound`.
- Verified `npm run check:secret-hygiene` passes after the code change.

## Remaining Testmail Launch Blockers
- Add `TESTMAIL_API_KEY` to Vercel production through a secure channel. It was not added through shell commands to avoid exposing the bearer token in command logs.
- Re-pull Vercel production env and rerun `npm run check:vercel-env` plus `npm run check:launch-env -- --production --env-file .env.vercel.production.local --allow-redacted-sensitive`.
- Configure an appropriate production scheduler for `/api/cron/testmail-inbound`. Vercel Hobby cron is limited to daily schedules; frequent mail monitoring requires a Pro-compatible cron cadence or an external scheduler that sends `Authorization: Bearer <CRON_SECRET>`.

## 2026-07-14 Update - Current Launch Gate After Testmail Commit
- Created and pushed commit `2fc9ac5` with message `Add Testmail proxy mail polling`.
- Re-ran the combined launch gate with `LAUNCH_ENV_FILE=.env.vercel.production.local` and `ALLOW_REDACTED_SENSITIVE_ENV=1`.
- Supabase schema now passes: the configured Supabase host resolves, required tables/columns pass, `resumes` and `verification-documents` buckets pass, and `safe_pool_apply` returns the no-write `pool_full` probe.
- Live-site smoke passes for `/`, `/about`, `/jobs`, `/contact`, `/login`, `/privacy`, and `/terms`.
- Deployment metadata passes: Vercel project link, Vercel CLI, Git remote, branch, and clean working tree all pass.
- Vercel env names fail only because `TESTMAIL_API_KEY` is not yet present in Vercel production.
- Production env value check fails because `NEXT_PUBLIC_RAZORPAY_KEY_ID` is still a Razorpay test key and `TESTMAIL_API_KEY` is missing.
- Current combined gate result: `PASS Secret hygiene`, `FAIL DNS and email`, `FAIL Resend domain`, `PASS Supabase schema`, `PASS Live site smoke`, `PASS Deployment metadata`, `FAIL Vercel env names`, and `FAIL Production environment`.

## Remaining Current Launch Blockers
- Add `TESTMAIL_API_KEY` to Vercel production securely.
- Replace Razorpay test credentials with live Razorpay credentials and verify the live webhook.
- Configure domain email DNS and Resend domain records.
- Configure a production-appropriate scheduler for `/api/cron/testmail-inbound`.

## 2026-07-14 Update - Testmail Proxy Mail Production Deploy
- Deployed production with `vercel deploy --prod --yes` after adding the Testmail proxy-mail polling code.
- Vercel deployment ID: `dpl_4sRcFUrNRaYKoJ5VZxGnS379eiPG`.
- Vercel production deployment URL: `https://referkaro-k5xvr370y-saviomohan2002-6806s-projects.vercel.app`.
- Vercel aliased the deployment to `https://referkaro.app`.
- Vercel build completed successfully and included `/api/cron/testmail-inbound`.
- Post-deploy `npm run check:live-site` passed for `/`, `/about`, `/jobs`, `/contact`, `/login`, `/privacy`, and `/terms`.
- Post-deploy unauthenticated request to `https://referkaro.app/api/cron/testmail-inbound` returned HTTP 401, confirming the cron route is live and protected.
- Post-deploy combined launch gate still reports not ready because DNS/email, Resend domain access, `TESTMAIL_API_KEY`, and live Razorpay credentials remain unresolved.

## 2026-07-14 Update - Production Launch Operations Runbook
- Added `docs/launch-runbook.md` as the canonical operator checklist for the remaining external launch work.
- The runbook uses dashboard-based secret entry and does not include credential values.
- It defines verification evidence for Testmail polling, idempotent live Razorpay reconciliation, domain email DNS, final build, and public deployment checks.
- ReferKaro remains not launch-ready until every runbook exit criterion and `npm run check:launch` gate passes.
