# ReferKaro Project Status

**Last updated:** 2026-09-24

**Canonical production URL:** https://referkaro.app

**Repository branch:** `main`

**Latest verified revision:** `5eee298` (Razorpay test checkout, provider-backed payment verification, and atomic payment reconciliation)

**Overall status:** Deployed beta. Core referral workflows exist, but the product is not yet production-launch ready because payment activation and several final compliance/security checks remain open.

This is the canonical cross-agent handoff file. Older audit documents remain useful evidence, but their point-in-time status may be stale.

## Product Summary

ReferKaro is a two-sided referral platform. Job seekers apply to employee-posted referral opportunities, while verified employees review candidates, refer selected applicants, and can use AI-assisted resume ranking for eligible candidate pools.

## Verified Working

### Application and deployment

- Next.js 16 and React 19 application builds and deploys on Vercel.
- Production is reachable at `https://referkaro.app`.
- The latest production checks found no relevant Vercel runtime errors on the repaired routes.
- `npm run lint`, `npm run build`, and `npm run check:secret-hygiene` passed after the 2026-09-22 changes.
- Unauthenticated requests to protected job, verification, and legal-consent endpoints return HTTP 401.
- Razorpay Test Mode checkout opens successfully in production with the replacement test credentials; a controlled Starter Pack check created a server-side ₹99 order and pending 3-token transaction without completing a payment.

### Authentication and role flows

- Supabase provides authentication, PostgreSQL data storage, row-level security, and server-side data access.
- Job-seeker and employee role paths are implemented.
- The dashboard referral-request link now routes to the applications page.
- `/applications` loads successfully in production and renders the referral-request view.
- Signed-out access to `/verify` redirects to login.

### Employee verification

- `/verify` now includes full name, company, designation, compulsory work email, work-email OTP, and employment-evidence upload.
- Incorrect or rejected evidence can be resubmitted.
- Employees can request manual review.
- AI verification and admin verification are tracked separately.
- A successful verification result presents an explicit Continue action instead of automatically navigating away.
- AI-verified employees can continue into the employee workflow while admin review remains independently visible and auditable.
- Work-email OTP challenges are server-side, expiry-limited, attempt-limited, rate-limited, and stored as hashes rather than plaintext OTPs.

### Job creation and review

- Employee company is read from the verified profile and remains non-editable; Job role is an independent editable field on job creation.
- Candidate pools are fixed at exactly 10 applications in the UI, API, and database constraint.
- Single-referral and candidate-pool choices include the requested candidate-quality guidance.
- Submitted jobs enter an admin review state before public visibility.
- The official job-posting URL and supplied company/role data are captured for review.
- The prior unauthorized job-submission path was repaired by using the authenticated server client and server-owned profile values.
- Existing employee accounts must complete the new work-email/designation verification fields once before creating another job.

### Legal and privacy

- First authenticated use is gated by a mandatory legal-consent dialog for policy version `2026-09-22`.
- Privacy Policy is available at `/privacy` and the DPDP notice is available at `/data-protection`.
- Consent records include policy version and timestamp in a dedicated table.
- The legal copy identifies the Digital Personal Data Protection Act, 2023 and Digital Personal Data Protection Rules, 2025 without claiming certification or guaranteed compliance.

### Referral and email infrastructure

- Pooling and single-referral application flows have automated smoke-test evidence, including duplicate prevention, employee-application blocking, pool capacity, review transitions, and payment-pending behavior.
- Testmail inbound polling is protected and scheduled through Datadog.
- A production-domain Resend message was received by Testmail in a controlled test.
- A controlled Testmail proxy message was forwarded through Resend to Gmail, then finalized as `referred`; the proxy was deactivated.
- Resend DNS records were verified in the provider dashboard.

### Test payments

- Token and legacy success-fee orders use server-owned amounts; the browser cannot choose the price or token credit.
- Checkout completion requires a valid HMAC signature and a captured Razorpay payment matching the stored order, amount, and INR currency.
- Token crediting and success-fee fulfilment use idempotent database functions; success-fee fulfilment atomically updates the application and proxy email.
- Razorpay cancellation and payment-failure states now produce explicit user-facing messages.

### AI and administration

- Candidate-pool AI resume ranking and audited usage limits are implemented with the server-only Azure OpenAI `gpt-5-mini` deployment.
- Employment-evidence analysis and resume ranking share the centralized Azure OpenAI client; the retired Gemini dependency and production requirement were removed.
- Admin job review, employee manual review, and audit-oriented status fields are implemented.
- AI ranking is limited to two uses for the applicable referral pool flow.

## Implemented but Requiring Fresh End-to-End Validation

- Send a real work-email OTP in production, enter it, upload genuine employment evidence, and verify the full Continue flow with an owner-controlled account.
- Confirm rejected evidence exposes both Resubmit and Request Manual Review using an actual rejected verification record.
- Complete the existing admin test account's new designation and work-email fields, then create and submit a disposable job to verify prefill, URL review, and admin approval from end to end.
- Exercise an admin approval and rejection for both a job and an employee using disposable production records.
- Run AI resume ranking twice against a ten-candidate pool and confirm a third attempt is blocked and recorded.
- Re-run the complete seeker-to-referral production journey after payment is activated.
- Complete one controlled Razorpay Test Mode payment and confirm token crediting, duplicate verification idempotency, and the captured-payment webhook path.

No real OTP, employment evidence, legal acceptance, or disposable job record was created during the latest verification because those actions require owner-controlled data and alter production records.

## Open Blockers and Risks

### Launch blocker

- **Payments:** Razorpay Test Mode is working, but live merchant approval, production credentials, live webhook verification, refund/reconciliation checks, and one controlled real transaction are still required before launch.

### Compliance inputs still needed

- Incorporated legal-entity name: **Not found in repo.**
- Postal grievance/contact address: **Not found in repo.**
- Final approved retention schedule: **Not found in repo.**
- A qualified Indian privacy/legal professional should review the production notices and operational processes before public launch.

### Security and database follow-up

- Supabase leaked-password protection is disabled and should be enabled if available for the project plan.
- Review remaining Supabase advisor warnings, including GraphQL table visibility and authenticated access to security-definer referral RPCs. Row-level security still applies, but least-privilege exposure should be confirmed.
- Confirm intended service-role-only access for operational tables such as OTP challenges and audit logs, and document this decision.
- Re-run dependency and secret scans immediately before launch.

### Operational follow-up

- Confirm the Datadog Testmail schedule remains active and alert on repeated failures.
- Add production alerting and dashboards for authentication failures, email failures, job-review errors, payment webhook failures, and AI-ranking failures.
- Refresh all smoke tests after the payment provider is production-enabled.

## Current Architecture

- **Frontend and server:** Next.js App Router with React and TypeScript.
- **Hosting:** Vercel, including server-rendered pages and API route handlers.
- **Authentication and database:** Supabase Auth and PostgreSQL with row-level security.
- **Email:** Resend for outbound mail; Testmail namespace/proxy ingestion for referral forwarding.
- **Scheduling and monitoring:** Datadog workflow calls the protected Testmail polling route.
- **AI:** Server-side Azure OpenAI `gpt-5-mini` integration for verification and resume ranking; credentials remain server-only.
- **Payments:** Razorpay integration exists but is not live-ready.

## Important Database Changes

The migration `supabase/migrations/20260922090000_verification_consent_and_job_review.sql` adds:

- Profile fields for designation, work email, work-email verification, AI verification, admin verification, manual-review requests, and legal consent.
- Work-email OTP challenge storage with row-level security.
- Versioned legal-consent records with row-level security.
- Job-review fields for the official posting URL and review status.

Earlier migrations include launch-gap remediation, advisor remediation, atomic pool applications, audited AI-ranking usage, and production referral status transitions.

The migration `supabase/migrations/20260924093844_fixed_candidate_pool_size.sql` normalizes legacy single-referral rows and enforces a 10-application candidate pool at the database boundary.

The migration `supabase/migrations/20260924102302_razorpay_success_fee_reconciliation.sql` adds unique payment-ID enforcement and a service-role-only function for atomic success-fee fulfilment.

## Required Environment Variables

Use the existing environment templates and Vercel configuration. Never place values in this file or commit them.

- Supabase public and server credentials.
- Resend API key and sender address.
- Testmail API key and namespace settings.
- Datadog scheduler/connection secrets where applicable.
- `WORK_EMAIL_OTP_SECRET` for production OTP hashing.
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_BASE_URL`, and `AZURE_OPENAI_DEPLOYMENT` for server-side verification and ranking routes.
- Razorpay key ID, key secret, and webhook secret after live approval.

## Continuation Checklist for Another Agent

1. Read `AGENTS.md`, this file, `PLAN.md`, `docs/launch-readiness-audit.md`, and `docs/launch-runbook.md` before changing code.
2. Run `git status --short` and preserve unrelated local changes and generated artifacts.
3. Install the locked dependencies, then run `npm run lint`, `npm run build`, and `npm run check:secret-hygiene`.
4. Verify the current Vercel deployment and Supabase migration state before assuming the repository and production are synchronized.
5. Complete the manual validation items above with disposable, owner-approved production data.
6. Resolve live payment onboarding and test signature/webhook reconciliation before marking launch ready.
7. Re-run the launch scripts and update this file with command output, deployment revision, date, and any remaining exceptions.

## Evidence Index

- `docs/launch-readiness-audit.md`: chronological production readiness, email, Testmail, Datadog, Resend, and payment evidence.
- `docs/smoke-test-results.md`: automated referral-flow and edge-case results.
- `docs/launch-runbook.md`: production launch and rollback procedure.
- `supabase/migrations/`: authoritative database changes.
- Git revisions `abd1958`, `a2df531`, and `842e15e`: audited AI workflows, verification/review repair, and latest UI warning fix.

## Status Definition

Do not call ReferKaro production-ready until all launch blockers are closed, the owner-approved production journeys pass end to end, the security/compliance follow-ups are reviewed, and the evidence is recorded here.
